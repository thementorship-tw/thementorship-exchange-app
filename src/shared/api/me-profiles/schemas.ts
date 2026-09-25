import { z } from "zod";
import "zod-openapi";

import { exchangeInfoContentSchema } from "@/shared/api/exchange-info/schemas";
import { profileTypeSchema } from "@/shared/profile-types";

const myProfileStatusSchema = z.enum(["active", "delisted"]);

export const myProfileItemDoc = z
  .object({
    id: z.string(),
    type: profileTypeSchema,
    status: myProfileStatusSchema,
    offersText: z.string(),
    wantsText: z.string(),
    description: z.string().nullable(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: "MyProfileItem" });

export type MyProfileItem = z.infer<typeof myProfileItemDoc>;

export const myProfileListResponseDoc = z.object({
  data: z.array(myProfileItemDoc),
});

export type MyProfileListResponse = z.infer<typeof myProfileListResponseDoc>;

/** 設定中心下架貼文。 */
export const patchMyProfileDelistSchema = z.object({
  visible: z.literal(false).meta({ description: "設為 false 代表下架" }),
});

/** 設定中心修改貼文內容，含分類；換成別篇貼文已佔用的分類會回傳 409。 */
export const patchMyProfileContentSchema = exchangeInfoContentSchema;

export type PatchMyProfileContentInput = z.infer<
  typeof patchMyProfileContentSchema
>;

export const patchMyProfileSchema = z.union([
  patchMyProfileDelistSchema,
  patchMyProfileContentSchema,
]);

export type PatchMyProfileInput = z.infer<typeof patchMyProfileSchema>;

export const myProfileResponseDoc = z.object({
  data: myProfileItemDoc,
});

export type MyProfileResponse = z.infer<typeof myProfileResponseDoc>;
