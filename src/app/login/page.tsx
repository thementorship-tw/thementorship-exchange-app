import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { GoogleSignInButton } from "./google-sign-in-button";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallbackError: "Google 授權未完成，請再試一次。",
  OAuthSignin: "無法連線至 Google，請稍後再試。",
  Configuration: "登入服務設定有誤，請聯繫管理員。",
  Verification: "驗證連結已失效，請重新登入。",
  SessionRequired: "請先登入才能存取該頁面。",
};
const FALLBACK_ERROR = "登入失敗，請再試一次。";
const DEFAULT_CALLBACK_URL = "/home"; /** 登入後的預設去處 */
const ALLOWED_TARGETS = new Set(["/home"]);

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, callbackUrl } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;
  const requestedTarget = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;
  const callbackTarget =
    requestedTarget && ALLOWED_TARGETS.has(requestedTarget)
      ? requestedTarget
      : DEFAULT_CALLBACK_URL;

  if (!errorCode) {
    const session = await auth();
    if (session?.user) redirect(callbackTarget);
  }

  /**
   * TODO：白名單實作後，這裡要能顯示使用者目前登入資訊
   */
  const isRejected = errorCode === "AccessDenied";
  const errorMessage =
    errorCode && !isRejected
      ? (ERROR_MESSAGES[errorCode] ?? FALLBACK_ERROR)
      : null;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            登入 The Mentorship Exchange
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            請使用報名時填寫的 email 登入 Google。
          </p>
        </div>

        {isRejected && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            <p className="font-medium">這個帳號無法登入</p>
            <p>
              若報名時使用的是其他信箱，請改用該信箱登入；
              確認信箱無誤仍無法登入，請聯繫管理員。
            </p>
          </div>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {errorMessage}
          </p>
        )}

        <GoogleSignInButton callbackUrl={callbackTarget} />
      </main>
    </div>
  );
}
