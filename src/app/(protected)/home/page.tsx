import type { Metadata } from "next";
import { Plus } from "@phosphor-icons/react/ssr";

import { requireActiveUser } from "@/auth";
import { OceanScene } from "@/components/ocean-scene";
import { EXCHANGE_INFO_KEYWORD_MAX_LENGTH } from "@/shared/api/exchange-info/constants";

import { FilterBar } from "./filter-bar";
import { HomeSidebar } from "./home-sidebar";
import { buildExchangeInfoApiQuery, parseListParams } from "./list-params";
import { MobileHeader } from "./mobile-header";
import { PostList } from "./post-list";

export const metadata: Metadata = {
  title: "交流列表｜The Mentorship Exchange",
  description: "瀏覽曼陀號社群的技能與興趣、職涯交流貼文。",
};

export default async function HomePage({ searchParams }: PageProps<"/home">) {
  await requireActiveUser("/home");

  const params = await searchParams;
  const { q } = params;
  const keyword =
    typeof q === "string"
      ? q.trim().slice(0, EXCHANGE_INFO_KEYWORD_MAX_LENGTH)
      : "";
  const { types, sort } = parseListParams(params);

  // TODO: 關鍵字搜尋由夥伴串接，屆時把 keyword 帶進 buildExchangeInfoApiQuery。
  const apiQuery = buildExchangeInfoApiQuery({ types, sort });

  return (
    <main className="relative isolate flex h-dvh flex-col overflow-hidden bg-page">
      <OceanScene boatSide="left" />

      <MobileHeader />

      <div className="mx-auto grid min-h-0 w-full max-w-360 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-2 px-4 pb-2 md:px-6 md:landscape:grid-cols-[18.375rem_minmax(0,1fr)] md:landscape:grid-rows-[minmax(0,1fr)] md:landscape:gap-6 md:landscape:py-6 lg:grid-cols-[18.375rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-6 lg:py-6 xl:px-20">
        <h1 className="sr-only">交流列表</h1>

        <HomeSidebar />

        <PostList
          apiQuery={apiQuery}
          filterBar={<FilterBar params={{ types, sort, keyword }} />}
          filtered={types.length > 0}
        />
      </div>

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
