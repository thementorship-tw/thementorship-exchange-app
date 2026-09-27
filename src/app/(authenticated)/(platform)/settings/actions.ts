"use server";

import { LOGIN_PATH, signOut } from "@/auth";
import { withBasePath } from "@/shared/base-path";

export async function signOutAction(): Promise<void> {
  // 交給 Auth.js 的網址要含 basePath
  await signOut({ redirectTo: withBasePath(LOGIN_PATH) });
}
