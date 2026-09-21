import type { Metadata } from "next";

import { EXCHANGE_INFO_KEYWORD_MAX_LENGTH } from "@/shared/api/exchange-info/constants";

import { ExchangeList } from "./exchange-list";
import { FilterBar } from "./filter-bar";
import { buildExchangeInfoApiQuery, parseListParams } from "./list-params";
import { MobileHeader } from "./mobile-header";
import { PublishExchangeButton } from "./publish-exchange-button";

export const metadata: Metadata = {
  title: "交流列表｜The Mentorship Exchange",
  description: "瀏覽曼陀號社群的技能與興趣、職涯交流貼文。",
};

export default async function HomePage({ searchParams }: PageProps<"/home">) {
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
    <>
      <MobileHeader />

      <h1 className="sr-only">交流列表</h1>

      <div className="mx-auto grid min-h-0 w-full max-w-360 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-2 px-4 pb-2 md:px-0 md:landscape:gap-6 md:landscape:py-6 lg:gap-6 lg:py-6">
        <ExchangeList
          apiQuery={apiQuery}
          filterBar={<FilterBar params={{ types, sort, keyword }} />}
          filtered={types.length > 0}
        />
      </div>

      <PublishExchangeButton />
    </>
  );
}
