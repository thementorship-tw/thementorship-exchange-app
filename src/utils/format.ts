// 以下單位皆為 ms
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
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
 * - 一小時內：顯示「幾分鐘前」
 * - 一小時到 24 小時：顯示「幾小時前」
 * - 超過 24 小時到一週：顯示「幾天前」
 * - 一週以上：YYYY/MM/DD
 */
export function formatPostTime(createdAt: Date, now: Date): string {
  const elapsed = now.getTime() - createdAt.getTime();

  if (elapsed < HOUR) {
    return `${Math.max(1, Math.floor(elapsed / MINUTE))} 分鐘前`;
  }
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} 小時前`;
  if (elapsed <= WEEK) return `${Math.floor(elapsed / DAY)} 天前`;

  const parts = dateFormatter.formatToParts(createdAt);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value;

  return `${part("year")}/${part("month")}/${part("day")}`;
}
