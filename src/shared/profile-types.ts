export const PROFILE_TYPES = ["skillAndInterest", "career"] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  skillAndInterest: "技能與興趣",
  career: "職涯",
};
