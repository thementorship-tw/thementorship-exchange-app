import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OceanScene } from "@/components/ocean-scene";
import { isCurrentConsent } from "@/consent-versions";

import { LoginForm } from "./login-form";
import { getSafeCallbackUrl } from "./callback-url";

export const metadata: Metadata = {
  title: "登入｜The Mentorship Exchange",
  description: "使用報名曼陀號時的 Google 帳號登入。",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  const needsReconsent =
    session?.user !== undefined && !isCurrentConsent(session.consent);
  if (session?.user && !needsReconsent) redirect(callbackUrl);

  return (
    <main className="relative isolate min-h-dvh flex-1 overflow-hidden bg-[#e6f4ff]">
      <OceanScene />

      <section className="mx-auto flex min-h-dvh w-full max-w-7xl items-start justify-center px-4 pt-[26.5vh] md:landscape:justify-start md:landscape:px-16 md:landscape:pt-[31vh] lg:justify-start lg:px-16 lg:pt-[31vh] xl:px-36">
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center md:landscape:max-w-[54vw] lg:max-w-[54vw]">
          <h1 className="sr-only">登入 The Mentorship Exchange</h1>
          {/* CHECK: 重簽提示文案設計稿尚未定義 */}
          <p className="mb-5 text-body-lg text-brand md:landscape:mb-8 lg:mb-8">
            {needsReconsent
              ? "規範與隱私政策已更新，請重新勾選同意後登入"
              : "此專案僅開放予曼陀號社群參與者使用，請使用報名曼陀號時的帳號登入"}
          </p>
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}
