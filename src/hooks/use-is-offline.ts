"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getSnapshot() {
  return !navigator.onLine; // 瀏覽器目前是否連線
}

export function useIsOffline(): boolean {
  // 第三個參數是伺服器端渲染用的值：伺服器上沒有 navigator，先假設有網路，
  // 瀏覽器接手後才會改用 getSnapshot 抓真正的狀態
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
