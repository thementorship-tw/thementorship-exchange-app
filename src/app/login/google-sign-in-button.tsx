"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        signIn("google", { redirectTo: callbackUrl });
      }}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
    >
      <Image
        src="/google.svg"
        alt=""
        width={20}
        height={20}
        unoptimized
        className="size-5"
      />
      {pending ? "導向 Google…" : "使用 Google 登入"}
    </button>
  );
}
