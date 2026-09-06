import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { buttonClassName } from "@/components/button";

export default async function Home() {
  const session = await auth();

  // 已登入直接進 app，未登入導向自訂登入頁
  const ctaHref = session?.user ? "/home" : "/login";

  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-[#1e1e1e] px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/images/landing-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover object-bottom blur-lg"
        />
      </div>

      <Image
        src="/logo.png"
        alt="The Mentorship Exchange"
        width={62}
        height={60}
        priority
        className="mb-6 h-[60px] w-[62px]"
      />

      <h1 className="text-display text-inverse">在航程上，結伴學習不孤單</h1>

      <p className="mt-5 max-w-120 text-h1 text-inverse">
        你可以是老師、是學生，用專長交換專長，交流就是成長的開始。
      </p>

      <Link
        href={ctaHref}
        className={buttonClassName({
          variant: "secondary",
          size: "xl",
          className: "mt-8",
        })}
      >
        開始交換技能
        <span
          aria-hidden="true"
          className="ml-3 flex size-5 items-center justify-center rounded-pill bg-brand"
        >
          <span className="size-1.5 rounded-pill bg-surface" />
        </span>
      </Link>
    </main>
  );
}
