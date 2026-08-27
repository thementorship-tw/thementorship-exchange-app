"use server";

import { signIn } from "@/auth";

export type LoginState = {
  error: string | null;
};

const safeRedirectTo = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return "/home";
  if (!value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
};

export async function signInWithGoogle(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (formData.get("consent") !== "on") {
    return { error: "請先同意規範與隱私政策。" };
  }

  await signIn("google", {
    redirectTo: safeRedirectTo(formData.get("callbackUrl")),
  });

  return { error: null };
}
