"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

import { getSafeCallbackUrl } from "./callback-url";

export type LoginState = {
  error: string | null;
};

export async function signInWithGoogle(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (formData.get("consent") !== "on") {
    return { error: "請先同意規範與隱私政策。" };
  }

  try {
    // 登入中...
    await signIn("google", {
      redirectTo: getSafeCallbackUrl(
        formData.get("callbackUrl"),
        process.env.AUTH_URL,
      ),
    });
  } catch (error) {
    // 登入錯誤
    if (error instanceof AuthError) {
      return { error: "auth-error" };
    }

    // 可能是 NEXT_REDIRECT（Next.js 用來跳轉的特殊訊號），交還給 Next.js
    throw error;
  }

  return { error: null };
}
