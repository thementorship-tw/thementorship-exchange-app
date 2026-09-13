export const PROFILE_TYPES = ["skillAndInterest", "career"] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];
