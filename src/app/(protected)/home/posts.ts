import { formatPostTime } from "@/utils/format";

import type { ProfileListItem, ProfileType } from "./mock-profiles";

export type PostSummary = {
  id: string;
  type: ProfileType;
  /** 「我能提供」的內容。 */
  offersText: string;
  /** 「我想找」的內容。 */
  wantsText: string;
  /** 自由描述；null 代表沒有補充說明。 */
  description: string | null;
  author: {
    nickname: string;
    /** 職稱或專長領域，例如 UI/UX。 */
    jobTitle: string | null;
    avatarUrl: string | null;
  };
  /** 已格式化的發文時間 */
  timeLabel: string;
};

export const postTypeLabels: Record<ProfileType, string> = {
  skillAndInterest: "技能與興趣",
  career: "職涯",
};

export function toPostSummary(item: ProfileListItem, now: Date): PostSummary {
  return {
    id: item.id,
    type: item.type,
    offersText: item.offersText,
    wantsText: item.wantsText,
    description: item.description,
    author: {
      nickname: item.authorNickname,
      jobTitle: item.authorJobTitle,
      avatarUrl: item.authorAvatarUrl,
    },
    timeLabel: formatPostTime(item.createdAt, now),
  };
}
