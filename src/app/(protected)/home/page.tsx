import Image from "next/image";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin?callbackUrl=%2Fhome");

  const { name, email, image } = session.user;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-4">
          {image && (
            <Image
              src={image}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {name ?? "已登入"}
            </h1>
            {email && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {email}
              </p>
            )}
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
