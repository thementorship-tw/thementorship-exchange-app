import Link from "next/link";

import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  // 已登入直接進 app，未登入導向 Auth.js 內建登入頁
  const cta = session?.user
    ? { href: "/home", label: "進入 Home" }
    : { href: "/api/auth/signin", label: "登入" };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-start gap-6">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          The Mentorship Exchange
        </h1>

        <Link
          href={cta.href}
          className="rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {cta.label}
        </Link>
      </main>
    </div>
  );
}
