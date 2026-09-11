import { SearchIcon } from "@/components/icons";

/** 關鍵字搜尋輸入框；桌機在側欄，手機在頁首下方。 */
export function SearchField({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-12 border border-line bg-surface px-4 focus-within:outline-2 focus-within:outline-brand ${className}`}
    >
      <SearchIcon className="size-5 text-secondary" />
      {/* CHECK: 搜尋行為尚未實作，先呈現設計稿的輸入框外觀。 */}
      <input
        type="search"
        name="keyword"
        aria-label="關鍵字搜尋"
        placeholder="關鍵字搜尋…"
        className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-secondary"
      />
    </div>
  );
}
