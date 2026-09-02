import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { getSafeCallbackUrl } from "@/app/login/callback-url";
import {
  ACCOUNT_DISABLED_ERROR,
  CONSENT_REQUIRED_ERROR,
  SERVER_ERROR,
} from "@/app/login/login-errors";
import { readConsentReceipt } from "@/consent-receipt";
import { isCurrentConsent, type ConsentVersions } from "@/consent-versions";
import { createUserOnFirstLogin, recordReturningLogin } from "@/db/login";
import { findUserBySub, type SessionUser } from "@/db/user";
import { findActiveWhitelistEntry } from "@/db/whitelist";

declare module "next-auth" {
  interface Session {
    consent: ConsentVersions | null;
    sub: string | null;
  }
}

export const LOGIN_PATH = "/login";
export const FORCE_SIGN_OUT_PATH = "/api/auth/force-signout";

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
    return getSafeCallbackUrl(`${url.pathname}${url.search}${url.hash}`);
  } catch {
    return getSafeCallbackUrl(raw);
  }
}

async function loginErrorRedirect(code: string): Promise<string> {
  const params = new URLSearchParams({
    error: code,
    callbackUrl: await readCallbackUrl(),
  });
  return `${LOGIN_PATH}?${params}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: LOGIN_PATH,
    error: LOGIN_PATH,
  },
  callbacks: {
    authorized: ({ auth, request }) => {
      if (!auth?.user) return false;
      if (isCurrentConsent(auth.consent)) return true;

      const url = new URL(LOGIN_PATH, request.nextUrl);
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
            return loginErrorRedirect(ACCOUNT_DISABLED_ERROR);

          const receipt = await readConsentReceipt();
          if (receipt === null)
            return loginErrorRedirect(CONSENT_REQUIRED_ERROR);

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
        if (receipt === null) return loginErrorRedirect(CONSENT_REQUIRED_ERROR);

        await createUserOnFirstLogin({
          sub,
          email: profile.email,
          googleName,
          avatarUrl,
          session: whitelistEntry.session,
          receipt,
        });
      } catch (error) {
        console.error("[auth] signIn callback failed", error);
        return loginErrorRedirect(SERVER_ERROR);
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

function loginUrl(callbackUrl: string): string {
  return `${LOGIN_PATH}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export async function requireActiveUser(
  callbackUrl = "/home",
): Promise<ActiveSession> {
  const session = await auth();

  if (session?.user === undefined) redirect(loginUrl(callbackUrl));

  const user = await findUserBySub(session.sub ?? "");
  if (user === null || !user.active) redirect(FORCE_SIGN_OUT_PATH);

  const { consent } = session;
  if (!isCurrentConsent(consent)) redirect(loginUrl(callbackUrl));

  return { user, consent };
}
