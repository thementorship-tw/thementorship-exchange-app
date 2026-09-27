import {
  DEFAULT_EXCHANGE_INFO_SORT,
  exchangeInfoSortOrders,
  type ExchangeInfoSortOrder,
} from "@/shared/api/exchange-info/constants";
import { PROFILE_TYPES, type ProfileType } from "@/shared/profile-types";

export type ListParams = {
  types: ProfileType[]; /** 可複選；空陣列代表不篩選類型。 */
  sort: ExchangeInfoSortOrder;
  keyword: string;
};

function allValues(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseListParams(params: {
  type?: string | string[];
  sort?: string | string[];
}): Omit<ListParams, "keyword"> {
  const types = allValues(params.type);
  const [sort] = allValues(params.sort);

  return {
    types: PROFILE_TYPES.filter((value) => types.includes(value)),
    sort:
      exchangeInfoSortOrders.find((value) => value === sort) ??
      DEFAULT_EXCHANGE_INFO_SORT,
  };
}

export function buildExchangeInfoApiQuery({
  types,
  sort,
  keyword,
}: Pick<ListParams, "types" | "sort" | "keyword">): string {
  const query = new URLSearchParams();

  if (keyword) query.set("q", keyword);
  for (const type of PROFILE_TYPES.filter((value) => types.includes(value))) {
    query.append("type", type);
  }
  query.set("sort", sort);

  return query.toString();
}

export function buildListHref({ types, sort, keyword }: ListParams): string {
  const query = new URLSearchParams();

  if (keyword) query.set("q", keyword);
  for (const type of PROFILE_TYPES.filter((value) => types.includes(value))) {
    query.append("type", type);
  }
  if (sort !== DEFAULT_EXCHANGE_INFO_SORT) query.set("sort", sort);

  const search = query.toString();
  return search ? `/home?${search}` : "/home";
}
