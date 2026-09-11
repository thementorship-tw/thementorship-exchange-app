export const PROFILE_TYPES = ["skill", "career", "interest"] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];
