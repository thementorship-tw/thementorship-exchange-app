import { MagnifyingGlass } from "@phosphor-icons/react/ssr";

/** 關鍵字搜尋輸入框 */
export function SearchField({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-12 border border-line bg-surface px-4 focus-within:outline-2 focus-within:outline-brand ${className}`}
    >
      <MagnifyingGlass className="size-5 shrink-0 text-secondary" />
      {/* TODO: 搜尋尚未實作，先呈現設計稿的輸入框 UI。 */}
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
