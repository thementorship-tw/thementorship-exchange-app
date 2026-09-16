import type { ExchangeInfoListResponseItem } from "@/shared/api/exchange-info/schemas";
import { formatPostTime } from "@/utils/format";

/**
 * 卡片用的單筆交換資訊：欄位與 API 相同，createdAt 換成格式化好的 timeLabel。
 * 作者的 group 是學員組別，例如 UIUX。
 */
export type PostSummary = Omit<ExchangeInfoListResponseItem, "createdAt"> & {
  /** 已格式化的發文時間 */
  timeLabel: string;
};

export function toPostSummary(
  {
    createdAt,
    ...item
  }: Omit<ExchangeInfoListResponseItem, "createdAt"> & {
    createdAt: Date | string;
  },
  now: Date,
): PostSummary {
  return {
    id: item.id,
    type: item.type,
    offersText: item.offersText,
    wantsText: item.wantsText,
    description: item.description,
    author: {
      nickname: item.author.nickname,
      group: item.author.group,
      avatarUrl: item.author.avatarUrl,
    },
    timeLabel: formatPostTime(new Date(createdAt), now),
  };
}
