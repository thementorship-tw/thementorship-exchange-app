"use client";

import { useCallback, useState } from "react";

import { CONTACT_LOG_DEFAULT_PAGE_SIZE } from "@/shared/api/contact-logs/constants";
import type {
  ContactLogListResponse,
  ContactLogResponse,
} from "@/shared/api/contact-logs/types";

export type LoadStatus = "ready" | "loading" | "error";

/**
 * 共用的 Contact Logs 分頁載入邏輯，給「我的發文」收到的申請（按鈕觸發）
 * 與「我送出的申請」（捲動觸發）共用。`retry` 預設 false：捲動觸發的呼叫
 * 在 error 狀態下不會自動重打，只有明確呼叫 `loadMore(true)`（例如「重新載入」
 * 按鈕）才會在 error 狀態下重試，避免捲動事件在失敗後瘋狂重打 API。
 */
export function useContactLogPagination<T>({
  role,
  profileId,
  initialItems,
  initialTotalPages,
  mapItem,
}: {
  role: "sent" | "received";
  profileId?: string;
  initialItems: T[];
  initialTotalPages: number;
  mapItem: (log: ContactLogResponse, now: Date) => T;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [status, setStatus] = useState<LoadStatus>("ready");
  const hasMore = page < totalPages;

  const loadMore = useCallback(
    (retry = false) => {
      if ((!retry && status === "error") || status === "loading" || !hasMore)
        return;

      setStatus("loading");
      const params = new URLSearchParams({
        role,
        page: String(page + 1),
        pageSize: String(CONTACT_LOG_DEFAULT_PAGE_SIZE),
        ...(profileId === undefined ? {} : { profileId }),
      });

      void fetch(`/api/contact-logs?${params}`)
        .then(async (response) => {
          if (!response.ok)
            throw new Error(`Request failed: ${response.status}`);
          return (await response.json()) as ContactLogListResponse;
        })
        .then((result) => {
          const now = new Date();
          setItems((current) => [
            ...current,
            ...result.data.map((log) => mapItem(log, now)),
          ]);
          setPage(result.pagination.page);
          setTotalPages(result.pagination.totalPages);
          setStatus("ready");
        })
        .catch((error: unknown) => {
          console.error("Failed to load contact logs", error);
          setStatus("error");
        });
    },
    [role, profileId, page, hasMore, status, mapItem],
  );

  return { items, status, hasMore, loadMore };
}
