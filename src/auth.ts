import { cookies } from "next/headers";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { getSafeCallbackUrl } from "@/app/login/callback-url";
import { CONSENT_REQUIRED_ERROR, SERVER_ERROR } from "@/app/login/login-errors";
import { readConsentReceipt } from "@/consent-receipt";
import { recordLogin } from "@/db/login";
import { findActiveWhitelistEntry } from "@/db/whitelist";

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
  return `/login?${params}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
    /**
     * 白名單比對：只有 whitelist 內且 active 的已驗證 Google email 能建立 session
     */
    signIn: async ({ account, profile }) => {
      if (account?.provider !== "google") return false;
      if (profile?.email_verified !== true || !profile.email) return false;

      try {
        const whitelistEntry = await findActiveWhitelistEntry(profile.email);
        if (whitelistEntry === null) return false;

        const receipt = await readConsentReceipt();
        if (receipt === null) return loginErrorRedirect(CONSENT_REQUIRED_ERROR);

        await recordLogin({
          sub: profile.sub ?? account.providerAccountId,
          email: profile.email,
          googleName: profile.name!,
          avatarUrl:
            typeof profile.picture === "string" ? profile.picture : null,
          session: whitelistEntry.session,
          receipt,
        });
      } catch (error) {
        console.error("[auth] signIn callback failed", error);
        return loginErrorRedirect(SERVER_ERROR);
      }

      return true;
    },
  },
});
