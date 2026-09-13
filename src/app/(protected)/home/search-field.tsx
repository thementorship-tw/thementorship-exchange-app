"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react/ssr";
import { useRef, useState } from "react";

/** 關鍵字搜尋輸入框 */
export function SearchField({ className = "" }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  const filled = keyword !== "";

  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-12 border bg-surface px-4 focus-within:outline-2 focus-within:outline-brand ${filled ? "border-brand" : "border-line"} ${className}`}
    >
      <MagnifyingGlass className="size-5 shrink-0 text-secondary" />
      {/* TODO: 搜尋尚未實作，先呈現設計稿的輸入框 UI。 */}
      <input
        ref={inputRef}
        type="search"
        name="keyword"
        aria-label="關鍵字搜尋"
        placeholder="關鍵字搜尋…"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-secondary [&::-webkit-search-cancel-button]:appearance-none"
      />
      {filled && (
        <button
          type="button"
          aria-label="清除關鍵字"
          onClick={() => {
            setKeyword("");
            inputRef.current?.focus();
          }}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-secondary"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
