import { z } from "zod";
import "zod-openapi";

import { PROFILE_TYPES } from "@/shared/profile-types";

const myProfileTypeSchema = z.enum(PROFILE_TYPES);
const myProfileStatusSchema = z.enum(["active", "delisted"]);

export const myProfileItemDoc = z
  .object({
    id: z.string(),
    type: myProfileTypeSchema,
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

/** 設定中心下架貼文；目前僅支援 visible=false。 */
export const patchMyProfileSchema = z.object({
  visible: z.literal(false).meta({ description: "設為 false 代表下架" }),
});

export type PatchMyProfileInput = z.infer<typeof patchMyProfileSchema>;

export const myProfileResponseDoc = z.object({
  data: myProfileItemDoc,
});

export type MyProfileResponse = z.infer<typeof myProfileResponseDoc>;
