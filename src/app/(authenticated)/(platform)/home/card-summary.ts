import type { ExchangeInfoListResponseItem } from "@/shared/api/exchange-info/schemas";
import { formatPostTime } from "@/utils/format";

/**
 * 卡片用的單筆交換資訊：欄位與 API 相同，createdAt、updatedAt 換成格式化好的 timeLabel。
 */
export type CardSummary = Omit<
  ExchangeInfoListResponseItem,
  "createdAt" | "updatedAt"
> & {
  /** 已格式化的最後更新時間 */
  timeLabel: string;
};

export function toCardSummary(
  {
    updatedAt,
    ...item
  }: Omit<ExchangeInfoListResponseItem, "createdAt" | "updatedAt"> & {
    createdAt: Date | string;
    updatedAt: Date | string;
  },
  now: Date,
): CardSummary {
  return {
    id: item.id,
    type: item.type,
    offersText: item.offersText,
    wantsText: item.wantsText,
    description: item.description,
    appliedWithinCooldown: item.appliedWithinCooldown,
    author: {
      nickname: item.author.nickname,
      group: item.author.group,
      avatarUrl: item.author.avatarUrl,
    },
    timeLabel: formatPostTime(new Date(updatedAt), now),
  };
}
