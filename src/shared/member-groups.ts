export const MEMBER_GROUPS = [
  "BD",
  "Data",
  "Engineering",
  "UIUX",
  "PM",
  "Marketing",
] as const;
export type MemberGroup = (typeof MEMBER_GROUPS)[number];
