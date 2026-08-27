import Link from "next/link";

import { OceanScene } from "@/components/ocean-scene";

export default function NotFound() {
  return (
    <main className="relative isolate min-h-dvh flex-1 overflow-hidden bg-[#e6f4ff]">
      <OceanScene />

      <section className="mx-auto flex min-h-dvh w-full max-w-[1280px] items-start justify-center px-4 pt-[26vh] md:landscape:justify-start md:landscape:px-16 md:landscape:pt-[31vh] lg:justify-start lg:px-16 lg:pt-[31vh] xl:px-36">
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center md:landscape:max-w-[54vw] lg:max-w-[54vw]">
          <h1 className="text-h1 text-primary">這片海域沒有東西</h1>
          <p className="mt-5 text-body-lg text-secondary">
            你要找的頁面不存在，或是連結已經失效。回到首頁重新出發吧。
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-16 w-full min-w-44 items-center justify-center rounded-pill border border-brand bg-brand px-8 text-body-lg-strong text-inverse shadow-sm transition hover:bg-[#080d43] active:translate-y-px focus-visible:outline-2 focus-visible:outline-brand sm:w-auto"
          >
            回到首頁
          </Link>
        </div>
      </section>
    </main>
  );
}
