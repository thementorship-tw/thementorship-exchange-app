"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react/ssr";
import { useDebounceFn } from "@reactuses/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { EXCHANGE_INFO_KEYWORD_MAX_LENGTH } from "@/shared/api/exchange-info/constants";

const SEARCH_DEBOUNCE_MS = 300;

export function SearchField({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const urlKeyword = useSearchParams().get("q") ?? "";

  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState(urlKeyword);
  const [syncedKeyword, setSyncedKeyword] = useState(urlKeyword);
  const [focused, setFocused] = useState(false);
  const filled = keyword !== "";

  // 網址關鍵字改變時同步輸入框；輸入中保留尚未送出的文字。
  if (urlKeyword !== syncedKeyword) {
    setSyncedKeyword(urlKeyword);
    if (!focused) setKeyword(urlKeyword);
  }

  function replaceKeyword(value: string) {
    // 送出時才讀網址，保留等待期間其他參數（例如篩選）的變動。
    const params = new URLSearchParams(window.location.search);
    const trimmed = value.trim();
    if (trimmed === (params.get("q") ?? "")) return;

    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const debouncedReplaceKeyword = useDebounceFn(
    replaceKeyword,
    SEARCH_DEBOUNCE_MS,
  );

  function handleClearKeyword() {
    setKeyword("");
    debouncedReplaceKeyword.cancel();
    replaceKeyword("");
    inputRef.current?.focus();
  }

  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-12 border bg-surface px-4 focus-within:outline-2 focus-within:outline-brand ${filled ? "border-brand" : "border-line"} ${className}`}
    >
      <MagnifyingGlass className="size-5 shrink-0 text-secondary" />
      <input
        ref={inputRef}
        type="search"
        name="keyword"
        aria-label="關鍵字搜尋"
        placeholder="關鍵字搜尋…"
        maxLength={EXCHANGE_INFO_KEYWORD_MAX_LENGTH}
        value={keyword}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => {
          setKeyword(event.target.value);
          debouncedReplaceKeyword.run(event.target.value);
        }}
        className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-secondary [&::-webkit-search-cancel-button]:appearance-none"
      />
      {filled && (
        <button
          type="button"
          aria-label="清除關鍵字"
          onClick={handleClearKeyword}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-secondary"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
