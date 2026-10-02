"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ExchangeInfoListResponse } from "@/shared/api/exchange-info/schemas";
import { withBasePath } from "@/shared/base-path";

import { usePublishExchange } from "../_providers/publish-exchange-provider";
import { toCardSummary, type CardSummary } from "./card-summary";

export type FeedStatus = "loading" | "ready" | "error";

async function fetchExchangeInfoPage(
  query: string,
  cursor: string | null,
  signal: AbortSignal,
): Promise<ExchangeInfoListResponse> {
  const params = new URLSearchParams(query);
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(withBasePath(`/api/exchange-info?${params}`), {
    signal,
  });
  if (!response.ok) {
    throw new Error(`GET /api/exchange-info failed with ${response.status}`);
  }
  return response.json();
}

/** 用第一筆的 id 和更新時間判斷列表開頭有沒有變；空列表回傳 null。 */
function firstItemKey(page: ExchangeInfoListResponse): string | null {
  const first = page.data[0];
  return first ? `${first.id}:${first.updatedAt}` : null;
}

/**
 * 從 /api/exchange-info 分頁讀取交換資訊。
 * 掛載時載入第一頁；query 變了請用 key 重新掛載元件，狀態才會歸零。
 *
 * @param query 不含 cursor 的查詢字串，例如 "type=career&sort=oldest"
 */
export function useExchangeInfoFeed(query: string) {
  const { feedRevision } = usePublishExchange();
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedStatus>("loading");
  /** 背景檢查到、但還沒換上的較新第一頁；有值時顯示「有較新的內容」提示。 */
  const [newerPage, setNewerPage] = useState<ExchangeInfoListResponse | null>(
    null,
  );
  const controllerRef = useRef<AbortController | null>(null);
  const checkControllerRef = useRef<AbortController | null>(null);
  const handledFeedRevisionRef = useRef(feedRevision);
  /** 目前畫面上第一頁的 firstItemKey，用來判斷背景抓到的第一頁是不是比較新。 */
  const firstItemKeyRef = useRef<string | null>(null);

  const applyPage = useCallback(
    (page: ExchangeInfoListResponse, cursor: string | null) => {
      const now = new Date();
      const nextCards = page.data.map((item) => toCardSummary(item, now));

      setCards((current) => (cursor ? [...current, ...nextCards] : nextCards));
      setNextCursor(page.nextCursor);
      setStatus("ready");
      if (cursor === null) {
        firstItemKeyRef.current = firstItemKey(page);
        setNewerPage(null);
      }
    },
    [],
  );

  const fetchPage = useCallback(
    (cursor: string | null) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      return fetchExchangeInfoPage(query, cursor, controller.signal).then(
        (page) => applyPage(page, cursor),
        (error: unknown) => {
          if (controller.signal.aborted) return;
          console.error(error);
          setStatus("error");
        },
      );
    },
    [query, applyPage],
  );

  useEffect(() => {
    void fetchPage(null);
    return () => {
      controllerRef.current?.abort();
      checkControllerRef.current?.abort();
    };
  }, [fetchPage]);

  // 發文成功後，立即重新載入首頁貼文列表
  useEffect(() => {
    if (handledFeedRevisionRef.current === feedRevision) return;

    handledFeedRevisionRef.current = feedRevision;
    void fetchPage(null);
  }, [feedRevision, fetchPage]);

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

  /**
   * 在背景重新抓第一頁，失敗時不動目前的列表、也不顯示錯誤。
   * 抓完時 `isScrolledAway()` 為 false 就直接換上；否則只有第一筆變了才記下來，等使用者點提示。
   */
  const checkForUpdates = useCallback(
    async (isScrolledAway: () => boolean) => {
      // 正在載入（第一頁、下一頁或重試）時不重複抓。
      if (status === "loading") return;

      checkControllerRef.current?.abort();
      const controller = new AbortController();
      checkControllerRef.current = controller;

      let page: ExchangeInfoListResponse;
      try {
        page = await fetchExchangeInfoPage(query, null, controller.signal);
      } catch (error: unknown) {
        if (!controller.signal.aborted) console.error(error);
        return;
      }
      if (controller.signal.aborted) return;

      if (!isScrolledAway()) {
        // 換掉整個列表，進行中的載入下一頁也要取消，不然舊的第二頁會接在新的第一頁後面。
        controllerRef.current?.abort();
        applyPage(page, null);
      } else if (firstItemKey(page) !== firstItemKeyRef.current) {
        setNewerPage(page);
      }
    },
    [status, query, applyPage],
  );

  /** 換上背景檢查到的較新第一頁。 */
  const showNewer = useCallback(() => {
    if (newerPage === null) return;
    controllerRef.current?.abort();
    applyPage(newerPage, null);
  }, [newerPage, applyPage]);

  return {
    cards,
    status,
    hasMore: nextCursor !== null,
    hasNewer: newerPage !== null,
    loadMore,
    retry,
    checkForUpdates,
    showNewer,
  };
}
