import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { requireActiveUser } from "@/auth";
import { OceanScene } from "@/components/ocean-scene";

import { HomeSidebar } from "./home-sidebar";
import { MobileHeader } from "./mobile-header";
import { listProfiles } from "./mock-profiles";
import { PostList } from "./post-list";
import { toPostSummary } from "./posts";

export const metadata: Metadata = {
  title: "交流列表｜The Mentorship Exchange",
  description: "瀏覽曼陀號社群的技能與興趣、職涯交流貼文。",
};

export default async function HomePage() {
  await requireActiveUser("/home");

  const items = await listProfiles();
  const now = new Date();
  const posts = items.map((item) => toPostSummary(item, now));

  return (
    <main className="relative isolate flex h-dvh flex-col overflow-hidden bg-page">
      <OceanScene boatSide="left" />

      <MobileHeader />

      <div className="mx-auto flex min-h-0 w-full max-w-360 flex-1 flex-col gap-6 px-4 pb-2 md:px-6 md:landscape:flex-row md:landscape:py-6 lg:flex-row lg:py-6 xl:px-20">
        <h1 className="sr-only">交流列表</h1>

        <HomeSidebar />

        <PostList posts={posts} />
      </div>

      {/* TODO: 發文流程 尚未實作。 */}
      <button
        type="button"
        aria-label="我要發文"
        className="fixed right-4 bottom-6 z-20 flex size-12 cursor-pointer items-center justify-center rounded-pill bg-brand text-inverse shadow-lg transition active:translate-y-px focus-visible:outline-2 focus-visible:outline-brand md:landscape:hidden lg:hidden"
      >
        <Plus className="size-6" />
      </button>
    </main>
  );
}
