import { z } from "zod";

import { MEMBER_GROUPS } from "@/shared/member-groups";
import { PROFILE_TYPES } from "@/shared/profile-types";

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
export type CreateExchangeInfoInput = z.infer<typeof createExchangeInfoSchema>;

const exchangeInfoItemDoc = z
  .object({
    id: z.string(),
    type: exchangeInfoTypeSchema,
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
