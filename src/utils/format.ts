const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei", // 固定用台北時區，結果才不會隨部署環境改變
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * 將發文時間格式化成相對時間。
 * - 24 小時內：顯示「幾小時前」
 * - 超過 24 小時到一週：顯示「幾天前」
 * - 一週以上：YYYY/MM/DD
 */
export function formatPostTime(createdAt: Date, now: Date): string {
  const elapsed = now.getTime() - createdAt.getTime();

  if (elapsed < DAY) {
    return `${Math.max(1, Math.floor(elapsed / HOUR))} 小時前`;
  }
  if (elapsed <= WEEK) return `${Math.floor(elapsed / DAY)} 天前`;

  const parts = dateFormatter.formatToParts(createdAt);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value;

  return `${part("year")}/${part("month")}/${part("day")}`;
}
