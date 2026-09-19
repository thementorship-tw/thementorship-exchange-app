"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ExchangeInfoListResponse } from "@/shared/api/exchange-info/schemas";

import { toCardSummary, type CardSummary } from "./card-summary";

export type FeedStatus = "loading" | "ready" | "error";

async function fetchExchangeInfoPage(
  query: string,
  cursor: string | null,
  signal: AbortSignal,
): Promise<ExchangeInfoListResponse> {
  const params = new URLSearchParams(query);
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(`/api/exchange-info?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`GET /api/exchange-info failed with ${response.status}`);
  }
  return response.json();
}

/**
 * 從 /api/exchange-info 分頁讀取交換資訊。
 * 掛載時載入第一頁；query 變了請用 key 重新掛載元件，狀態才會歸零。
 *
 * @param query 不含 cursor 的查詢字串，例如 "type=career&sort=oldest"
 */
export function useExchangeInfoFeed(query: string) {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const controllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    (cursor: string | null) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      return fetchExchangeInfoPage(query, cursor, controller.signal).then(
        (page) => {
          const now = new Date();
          const nextCards = page.data.map((item) => toCardSummary(item, now));

          setCards((current) =>
            cursor ? [...current, ...nextCards] : nextCards,
          );
          setNextCursor(page.nextCursor);
          setStatus("ready");
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          console.error(error);
          setStatus("error");
        },
      );
    },
    [query],
  );

  useEffect(() => {
    void fetchPage(null);
    return () => controllerRef.current?.abort();
  }, [fetchPage]);

  /** 載入下一頁。 */
  const loadMore = useCallback(() => {
    if (status !== "ready" || nextCursor === null) return;
    setStatus("loading");
    void fetchPage(nextCursor);
  }, [status, nextCursor, fetchPage]);

  const retry = useCallback(() => {
    setStatus("loading");
    void fetchPage(cards.length === 0 ? null : nextCursor);
  }, [cards.length, nextCursor, fetchPage]);

  return {
    cards,
    status,
    hasMore: nextCursor !== null,
    loadMore,
    retry,
  };
}
