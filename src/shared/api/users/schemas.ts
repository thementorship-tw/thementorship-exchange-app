import { z } from "zod";
import "zod-openapi";

import { requiredText } from "@/shared/api/validation";
import { MEMBER_GROUPS } from "@/shared/member-groups";

import { NICKNAME_MAX_LENGTH } from "./constants";

/** 設定中心 Profile 區塊顯示的使用者資料。 */
export const settingsProfileDoc = z
  .object({
    googleName: z.string(),
    group: z.enum(MEMBER_GROUPS),
    nickname: z.string(),
    avatarUrl: z.string().nullable(),
  })
  .meta({ id: "SettingsProfile" });

export type SettingsProfile = z.infer<typeof settingsProfileDoc>;

export const meResponseDoc = z.object({
  data: settingsProfileDoc,
});

export type MeResponse = z.infer<typeof meResponseDoc>;

export const updateMeSchema = z.object({
  nickname: requiredText(NICKNAME_MAX_LENGTH).meta({
    description: "平台顯示暱稱",
    example: "Lena Liang",
  }),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
