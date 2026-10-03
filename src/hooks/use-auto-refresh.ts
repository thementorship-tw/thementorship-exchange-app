"use client";

import { useEffect, useEffectEvent } from "react";

/**
 * 頁面被切到背景（手機切 App、桌機切分頁或縮小視窗）超過 `thresholdMs` 後回來時呼叫 `onRefresh` 自動更新。
 * 只看 visibilitychange、不看 focus：頁面一直看得到時點別的視窗再點回來，不算離開。
 */
export function useAutoRefresh(thresholdMs: number, onRefresh: () => void) {
  const handleRefresh = useEffectEvent(onRefresh);

  useEffect(() => {
    let hiddenAt: number | null =
      document.visibilityState === "hidden" ? Date.now() : null;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt ??= Date.now();
        return;
      }
      if (hiddenAt === null) return;

      const awayMs = Date.now() - hiddenAt;
      hiddenAt = null;
      if (awayMs >= thresholdMs) handleRefresh();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [thresholdMs]);
}
