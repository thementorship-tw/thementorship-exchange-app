import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cache } from "react";

import { getSafeCallbackUrl } from "@/app/login/callback-url";
import { LOGIN_ERROR } from "@/app/login/login-errors";
import { readConsentReceipt } from "@/server/auth/consent-receipt";
import { stripBasePath, withBasePath } from "@/shared/base-path";
import {
  createUserOnFirstLogin,
  recordReturningLogin,
} from "@/server/auth/login.service";
import { findUserBySub, type SessionUser } from "@/server/auth/user.repository";
import { findActiveWhitelistEntry } from "@/server/auth/whitelist.repository";
import {
  isCurrentConsent,
  type ConsentVersions,
} from "@/shared/consent-versions";

declare module "next-auth" {
  interface Session {
    consent: ConsentVersions | null;
    sub: string | null;
  }
}

export const LOGIN_PATH = "/login";
export const FORCE_SIGN_OUT_PATH = "/api/auth/force-signout";

/**
 * 路徑語意約定：程式內部的 callbackUrl、LOGIN_PATH 一律是「不含 basePath」的路徑，
 * 這樣交給 Next.js 的 redirect() / <Link> 時不會重複加前綴。
 * 只有在「交給 Auth.js」的那一刻才用 withBasePath() 加上，因為 Auth.js 不認得
 * Next.js 的 basePath。見 src/shared/base-path.ts。
 */

const CONSENT_CLAIM = "consent";

const CALLBACK_URL_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.callback-url"
    : "authjs.callback-url";

async function readCallbackUrl(): Promise<string> {
  const raw = (await cookies()).get(CALLBACK_URL_COOKIE)?.value;
  if (raw === undefined) return getSafeCallbackUrl(null);

  try {
    const url = new URL(raw);
    return getSafeCallbackUrl(
      stripBasePath(`${url.pathname}${url.search}${url.hash}`),
    );
  } catch {
    return getSafeCallbackUrl(stripBasePath(raw));
  }
}

async function loginErrorRedirect(code: string): Promise<string> {
  const params = new URLSearchParams({
    error: code,
    callbackUrl: await readCallbackUrl(),
  });
  // signIn callback 回傳的字串由 Auth.js 當成導向網址，所以要含 basePath。
  // callbackUrl 參數本身維持不含 basePath，由登入頁回填表單後再交給 actions.ts。
  return withBasePath(`${LOGIN_PATH}?${params}`);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Next.js 的 basePath 不會傳給 Auth.js，要另外告訴它 auth 路由的完整位置
  basePath: withBasePath("/api/auth"),
  providers: [Google],
  pages: {
    signIn: withBasePath(LOGIN_PATH),
    error: withBasePath(LOGIN_PATH),
  },
  callbacks: {
    authorized: ({ auth, request }) => {
      if (!auth?.user) return false;
      if (isCurrentConsent(auth.consent)) return true;

      // 用 nextUrl.clone() 而不是 new URL(LOGIN_PATH, request.nextUrl)：
      // NextURL 會保留 basePath，而且它的 pathname 本來就不含 basePath。
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.search = "";
      url.searchParams.set(
        "callbackUrl",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(url);
    },
    /**
     *
     * - 既有帳號（Google sub 查得到）→ 依 `users.active` 決定放行或拒絕，不回查白名單
     * - 新使用者（查不到）→ 依 whitelist 決定是否首次建檔
     *
     */
    signIn: async ({ account, profile }) => {
      if (account?.provider !== "google") return false;
      if (profile?.email_verified !== true || !profile.email) return false;

      const sub = account.providerAccountId;
      const googleName =
        typeof profile.name === "string" && profile.name.trim()
          ? profile.name.trim()
          : profile.email;
      const avatarUrl =
        typeof profile.picture === "string" ? profile.picture : null;

      try {
        const existingUser = await findUserBySub(sub);

        if (existingUser !== null) {
          if (!existingUser.active)
            return loginErrorRedirect(LOGIN_ERROR.ACCOUNT_DISABLED);

          const receipt = await readConsentReceipt();
          if (receipt === null)
            return loginErrorRedirect(LOGIN_ERROR.CONSENT_REQUIRED);

          const { emailConflict } = await recordReturningLogin({
            userId: existingUser.id,
            email: profile.email,
            googleName,
            avatarUrl,
            receipt,
          });
          if (emailConflict) {
            console.error("[auth] Google 信箱已被其他帳號使用", {
              userId: existingUser.id,
            });
          }
          return true;
        }

        const whitelistEntry = await findActiveWhitelistEntry(profile.email);
        if (whitelistEntry === null) return false;

        const receipt = await readConsentReceipt();
        if (receipt === null)
          return loginErrorRedirect(LOGIN_ERROR.CONSENT_REQUIRED);

        await createUserOnFirstLogin({
          sub,
          email: profile.email,
          googleName,
          avatarUrl,
          session: whitelistEntry.session,
          group: whitelistEntry.group,
          receipt,
        });
      } catch (error) {
        console.error("[auth] signIn callback failed", error);
        return loginErrorRedirect(LOGIN_ERROR.SERVER_ERROR);
      }

      return true;
    },
    /**
     * 只在 OAuth callback 當下寫一次 token，之後每個請求直接讀，不必再查 DB
     */
    jwt: async ({ token, account }) => {
      if (account) {
        token.sub = account.providerAccountId;

        const receipt = await readConsentReceipt();
        token[CONSENT_CLAIM] = receipt && {
          termsVersion: receipt.termsVersion,
          privacyVersion: receipt.privacyVersion,
        };
      }

      return token;
    },
    session: ({ session, token }) => {
      session.sub = token.sub ?? null;
      session.consent =
        (token[CONSENT_CLAIM] as ConsentVersions | null | undefined) ?? null;
      return session;
    },
  },
});

type ActiveSession = {
  user: SessionUser;
  consent: ConsentVersions | null;
};

export type ActiveUserResult =
  | { ok: true; user: SessionUser; consent: ConsentVersions }
  | {
      ok: false;
      reason:
        | "unauthenticated"
        | "user_not_found"
        | "account_inactive"
        | "consent_required";
    };

function loginUrl(callbackUrl: string): string {
  return `${LOGIN_PATH}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export async function requireActiveUser(
  callbackUrl = "/home",
): Promise<ActiveSession> {
  const result = await resolveActiveUser();

  if (!result.ok) {
    if (
      result.reason === "user_not_found" ||
      result.reason === "account_inactive"
    ) {
      redirect(FORCE_SIGN_OUT_PATH);
    }

    redirect(loginUrl(callbackUrl));
  }

  return { user: result.user, consent: result.consent };
}

/**
 * 驗證 session、平台帳號與條款，不決定失敗時要 redirect 或回傳 HTTP error。
 * 用 React cache() 包起來，同一個 request 內（例如多層 layout 各自呼叫
 * requireActiveUser）只會真的查一次 DB。
 */
export const resolveActiveUser = cache(async (): Promise<ActiveUserResult> => {
  const session = await auth();

  if (session?.user === undefined || session.sub === null) {
    return { ok: false, reason: "unauthenticated" };
  }

  const user = await findUserBySub(session.sub);
  if (user === null) return { ok: false, reason: "user_not_found" };
  if (!user.active) return { ok: false, reason: "account_inactive" };

  const { consent } = session;
  if (!isCurrentConsent(consent) || consent === null) {
    return { ok: false, reason: "consent_required" };
  }

  return { ok: true, user, consent };
});
