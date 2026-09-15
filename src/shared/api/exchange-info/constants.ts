// 不依賴 zod，client component 也能直接 import，不會把 zod 打包進前端。

/** 列表每次載入的筆數。 */
export const EXCHANGE_INFO_PAGE_SIZE = 10;

/** 關鍵字（q）去頭尾空白後的最大字數。 */
export const EXCHANGE_INFO_KEYWORD_MAX_LENGTH = 100;

export const exchangeInfoSortOrders = ["newest", "oldest"] as const;
export type ExchangeInfoSortOrder = (typeof exchangeInfoSortOrders)[number];

/** 預設排序：最新的在上面。 */
export const DEFAULT_EXCHANGE_INFO_SORT: ExchangeInfoSortOrder = "newest";
