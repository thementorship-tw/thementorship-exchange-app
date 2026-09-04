import Image from "next/image";

import { requireActiveUser, signOut } from "@/auth";

export default async function HomePage() {
  const { user } = await requireActiveUser("/home");
  const { nickname, email, avatarUrl } = user;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-4">
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {nickname}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{email}</p>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            登出
          </button>
        </form>
      </main>
    </div>
  );
}
