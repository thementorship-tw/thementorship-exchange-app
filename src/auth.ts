import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { findActiveWhitelistEntry } from "@/db/whitelist";

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

      return (await findActiveWhitelistEntry(profile.email)) !== null;
    },
  },
});
