import type { Metadata } from "next";
import { Plus } from "@phosphor-icons/react/ssr";

import { MobileHeader } from "./mobile-header";
import { listProfiles } from "./mock-profiles";
import { PostList } from "./post-list";
import { toPostSummary } from "./posts";

export const metadata: Metadata = {
  title: "交流列表｜The Mentorship Exchange",
  description: "瀏覽曼陀號社群的技能與興趣、職涯交流貼文。",
};

export default async function HomePage() {
  const items = await listProfiles();
  const now = new Date();
  const posts = items.map((item) => toPostSummary(item, now));

  return (
    <>
      <MobileHeader />

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-2 md:px-0 md:landscape:pb-0 lg:pb-0">
        <h1 className="sr-only">交流列表</h1>
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
    </>
  );
}
