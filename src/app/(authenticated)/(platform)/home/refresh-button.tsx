"use client";

import { ArrowClockwise } from "@phosphor-icons/react/ssr";

import { useAppRefresh } from "../_providers/refresh-provider";

/** 篩選列最右邊的重整鍵：外框跟篩選 Tag 同款，觸控區 44×44 往外溢出，不撐高篩選列。 */
export function RefreshButton() {
  const { refreshing, refresh } = useAppRefresh();

  return (
    <button
      type="button"
      aria-label="重新整理"
      aria-busy={refreshing}
      onClick={refresh}
      className={`group -my-1.5 -mr-1.5 flex size-11 shrink-0 cursor-pointer items-center justify-center transition active:translate-y-px focus-visible:outline-2 focus-visible:outline-brand ${
        refreshing ? "text-brand" : "text-primary"
      }`}
    >
      <span className="flex size-8 items-center justify-center rounded-pill border border-line bg-surface group-active:bg-brand-subtle">
        <ArrowClockwise
          className={`size-4.5 ${refreshing ? "animate-spin" : ""}`}
        />
      </span>
    </button>
  );
}
