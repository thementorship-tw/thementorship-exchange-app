import { profileTypes, type ProfileType } from "@/db/schema";

import type { SortOrder } from "./mock-profiles";

export type ListParams = {
  type: ProfileType | null;
  order: SortOrder;
};

export const defaultListParams: ListParams = { type: null, order: "newest" };

const sortOrders: SortOrder[] = ["newest", "oldest"];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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
  const type = firstValue(params.type);
  const order = firstValue(params.order);

  return {
    type: profileTypes.find((value) => value === type) ?? null,
    order:
      sortOrders.find((value) => value === order) ?? defaultListParams.order,
  };
}

/** 產生列表頁連結；與 parseListParams 共用同一份規則，預設值不寫進網址。 */
export function buildListHref({ type, order }: ListParams): string {
  const query = new URLSearchParams();

  if (type !== null) query.set("type", type);
  if (order !== defaultListParams.order) query.set("order", order);

  const search = query.toString();
  return search === "" ? "/home" : `/home?${search}`;
}
