"use server";

import { signIn } from "@/auth";

import { issueConsentReceipt } from "@/consent-receipt";

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

  await issueConsentReceipt();

  await signIn("google", {
    redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
  });

  return { error: null };
}
