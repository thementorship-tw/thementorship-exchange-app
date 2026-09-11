import type { ProfileType } from "@/db/schema";

import type { ProfileListItem } from "./mock-profiles";

/** 列表卡片所需的貼文資料；時間已在 server 端格式化，避免 hydration 不一致。 */
export type PostSummary = {
  id: string;
  type: ProfileType;
  /** 「我能提供」的內容。 */
  offersText: string;
  /** 「我想找」的內容。 */
  wantsText: string;
  /** 自由描述；null 代表沒有補充說明，卡片不顯示展開按鈕。 */
  description: string | null;
  author: {
    nickname: string;
    /** 職稱或專長領域，例如 UI/UX。 */
    jobTitle: string | null;
    avatarUrl: string | null;
  };
  /** 已格式化的相對時間，例如「22小時前」。 */
  timeLabel: string;
};

export const postTypeLabels: Record<ProfileType, string> = {
  skill: "技能",
  career: "職涯聊天",
  interest: "興趣",
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const absoluteDateFormatter = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 超過七天就顯示日期；固定用台北時區，結果才不會隨部署環境的時區改變。 */
export function formatRelativeTime(value: Date, now: Date): string {
  const elapsed = now.getTime() - value.getTime();

  if (elapsed < MINUTE) return "剛剛";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}分鐘前`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}小時前`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}天前`;

  return absoluteDateFormatter.format(value);
}

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
    timeLabel: formatRelativeTime(item.createdAt, now),
  };
}
