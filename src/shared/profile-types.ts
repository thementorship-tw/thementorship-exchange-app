import { z } from "zod";

export const PROFILE_TYPES = ["skillAndInterest", "career"] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  skillAndInterest: "技能與興趣",
  career: "職涯",
};

/** 各處 zod schema 共用同一個 ProfileType enum，避免各自宣告後跑掉。 */
export const profileTypeSchema = z.enum(PROFILE_TYPES);
