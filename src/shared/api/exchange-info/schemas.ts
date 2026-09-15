import { z } from "zod";

import { MEMBER_GROUPS } from "@/shared/member-groups";
import { PROFILE_TYPES } from "@/shared/profile-types";

import {
  DEFAULT_EXCHANGE_INFO_SORT,
  EXCHANGE_INFO_KEYWORD_MAX_LENGTH,
  exchangeInfoSortOrders,
} from "./constants";

export {
  DEFAULT_EXCHANGE_INFO_SORT,
  EXCHANGE_INFO_KEYWORD_MAX_LENGTH,
  EXCHANGE_INFO_PAGE_SIZE,
  exchangeInfoSortOrders,
  type ExchangeInfoSortOrder,
} from "./constants";

const exchangeInfoTypeSchema = z.enum(PROFILE_TYPES);

export type ExchangeInfoListQuery = z.infer<typeof exchangeInfoListQuerySchema>;

export const exchangeInfoListQuerySchema = z.object({
  type: z.array(exchangeInfoTypeSchema).default([]).meta({
    description:
      "標籤篩選，可帶入多個標籤，例如 ?type=skillAndInterest&type=career",
  }),
  q: z.string().trim().max(EXCHANGE_INFO_KEYWORD_MAX_LENGTH).optional().meta({
    description: "關鍵字，比對標題（我能提供、我想找）與展開後的內文",
  }),
  sort: z
    .enum(exchangeInfoSortOrders)
    .default(DEFAULT_EXCHANGE_INFO_SORT)
    .meta({ description: "排序，預設最新的在上面" }),
  cursor: z
    .string()
    .optional()
    .meta({ description: "上一頁回傳的 nextCursor；第一頁不用帶" }),
});

export const createExchangeInfoSchema = z.object({
  type: exchangeInfoTypeSchema,
  offersText: z.string().trim().min(1).max(500),
  wantsText: z.string().trim().min(1).max(500),
  description: z
    .string()
    .trim()
    .max(2000)
    .nullish()
    .transform((value) => (value ? value : null)),
});
export type CreateExchangeInfoInput = z.infer<typeof createExchangeInfoSchema>;

const exchangeInfoItemDoc = z
  .object({
    id: z.string(),
    type: exchangeInfoTypeSchema,
    offersText: z.string(),
    wantsText: z.string(),
    description: z.string().nullable(),
    createdAt: z.iso.datetime(),
    author: z.object({
      nickname: z.string(),
      group: z.enum(MEMBER_GROUPS),
      avatarUrl: z.string().nullable(),
    }),
  })
  .meta({ id: "ExchangeInfoListItem" });

/**
 * 單筆交換資訊的唯一來源；repository、假資料與卡片的型別都從這裡推導。
 * 這是 API 回傳的 JSON，createdAt 是 ISO 字串。
 */
export type ExchangeInfoListResponseItem = z.infer<typeof exchangeInfoItemDoc>;

/** GET /api/exchange-info 回傳的 JSON。 */
export type ExchangeInfoListResponse = z.infer<
  typeof exchangeInfoListResponseDoc
>;

export const exchangeInfoListResponseDoc = z.object({
  data: z.array(exchangeInfoItemDoc),
  nextCursor: z
    .string()
    .nullable()
    .meta({ description: "null 代表沒有下一頁" }),
});

export const createExchangeInfoResponseDoc = z.object({
  data: exchangeInfoItemDoc,
});

export const apiErrorResponseDoc = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      fields: z.record(z.string(), z.string()).optional(),
    }),
  })
  .meta({ id: "ApiError" });
