import { z } from "zod";

import { MEMBER_GROUPS } from "@/shared/member-groups";
import { profileTypeSchema } from "@/shared/profile-types";

import {
  DEFAULT_EXCHANGE_INFO_SORT,
  EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH,
  EXCHANGE_INFO_KEYWORD_MAX_LENGTH,
  EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH,
  EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH,
  exchangeInfoSortOrders,
} from "./constants";

export {
  DEFAULT_EXCHANGE_INFO_SORT,
  EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH,
  EXCHANGE_INFO_KEYWORD_MAX_LENGTH,
  EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH,
  EXCHANGE_INFO_PAGE_SIZE,
  EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH,
  exchangeInfoSortOrders,
  type ExchangeInfoSortOrder,
} from "./constants";

export type ExchangeInfoListQuery = z.infer<typeof exchangeInfoListQuerySchema>;

export const exchangeInfoListQuerySchema = z.object({
  type: z.array(profileTypeSchema).default([]).meta({
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

/** 一篇交流貼文的內容欄位；新增與修改都是這組欄位，跟操作動詞無關。 */
export const exchangeInfoContentSchema = z.object({
  type: profileTypeSchema,
  offersText: z
    .string()
    .trim()
    .min(1)
    .max(EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH),
  wantsText: z.string().trim().min(1).max(EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH),
  description: z
    .string()
    .trim()
    .max(EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH)
    .nullish()
    .transform((value) => (value ? value : null)),
});
export type ExchangeInfoContentInput = z.infer<
  typeof exchangeInfoContentSchema
>;

/** 新增交換資訊：目前跟內容欄位完全一樣。 */
export const createExchangeInfoSchema = exchangeInfoContentSchema;
export type CreateExchangeInfoInput = ExchangeInfoContentInput;

const exchangeInfoItemDoc = z
  .object({
    id: z.string(),
    type: profileTypeSchema,
    offersText: z.string(),
    wantsText: z.string(),
    description: z.string().nullable(),
    /** 目前登入者是否仍在這篇貼文的重複申請冷卻期內。 */
    appliedWithinCooldown: z.boolean(),
    createdAt: z.iso.datetime(),
    author: z.object({
      nickname: z.string(),
      group: z.enum(MEMBER_GROUPS),
      avatarUrl: z.string().nullable(),
    }),
  })
  .meta({ id: "ExchangeInfoListItem" });

export type ExchangeInfoListResponseItem = z.infer<typeof exchangeInfoItemDoc>;

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

export const exchangeInfoAvailabilityResponseDoc = z.object({
  data: z.object({
    publishedTypes: z.array(profileTypeSchema),
    availableTypes: z.array(profileTypeSchema),
  }),
});
export type ExchangeInfoAvailabilityResponse = z.infer<
  typeof exchangeInfoAvailabilityResponseDoc
>;
