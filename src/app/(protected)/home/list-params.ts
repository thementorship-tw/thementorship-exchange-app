import { profileTypes, type ProfileType } from "@/db/schema";

import type { SortOrder } from "./mock-profiles";

export type ListParams = {
  /** 可複選；空陣列代表不篩選類型。 */
  types: ProfileType[];
  order: SortOrder;
};

export const defaultListParams: ListParams = { types: [], order: "newest" };

const sortOrders: SortOrder[] = ["newest", "oldest"];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** 逗號分隔與重複出現的 type 參數都收下，手打網址的兩種寫法都能動。 */
function allValues(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];

  return (Array.isArray(value) ? value : [value]).flatMap((entry) =>
    entry.split(",").map((part) => part.trim()),
  );
}

/**
 * 解析列表頁的 query string。
 *
 * 認不得的值一律退回預設，使用者手改網址不該讓頁面壞掉。
 */
export function parseListParams(params: {
  type?: string | string[];
  order?: string | string[];
}): ListParams {
  const types = allValues(params.type);
  const order = firstValue(params.order);

  return {
    // 用 profileTypes 過濾，順便去重並固定成同一種排列。
    types: profileTypes.filter((value) => types.includes(value)),
    order:
      sortOrders.find((value) => value === order) ?? defaultListParams.order,
  };
}

/** 產生列表頁連結；與 parseListParams 共用同一份規則，預設值不寫進網址。 */
export function buildListHref({ types, order }: ListParams): string {
  const query = new URLSearchParams();
  // 同一組選擇永遠產生同一個網址，prefetch 與上一頁才不會各有一份。
  const canonicalTypes = profileTypes.filter((value) => types.includes(value));

  // 用重複參數而不是逗號串接，逗號會被編成 %2C，網址讀起來很醜。
  for (const type of canonicalTypes) query.append("type", type);
  if (order !== defaultListParams.order) query.set("order", order);

  const search = query.toString();
  return search === "" ? "/home" : `/home?${search}`;
}
