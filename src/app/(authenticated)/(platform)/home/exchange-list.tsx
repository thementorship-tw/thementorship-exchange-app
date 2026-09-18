"use client";

import { CircleNotch, WifiSlash } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/button";
import {
  ErrorState,
  LOAD_FAILED_ERROR_DESCRIPTION,
  LOAD_FAILED_ERROR_TITLE,
  OFFLINE_ERROR_DESCRIPTION,
  OFFLINE_ERROR_TITLE,
} from "@/components/error-state";
import { useIsOffline } from "@/hooks/use-is-offline";

import { ExchangeCard } from "./exchange-card";
import { useExchangeInfoFeed, type FeedStatus } from "./use-exchange-info-feed";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-20 bg-glass px-8 py-12 text-center md:landscape:flex-1 lg:flex-1">
      <p className="text-h2 text-primary">還沒有人發文</p>
      <p className="text-body text-secondary">
        目前還沒有任何交換貼文。想交換的就自己先發文吧，第一個發文的人最容易被看見。
      </p>
    </div>
  );
}

function NoMatchState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-20 bg-glass px-8 py-12 text-center md:landscape:flex-1 lg:flex-1">
      <p className="text-h2 text-primary">沒有符合條件的貼文</p>
      <p className="text-body text-secondary">換個篩選條件試試看。</p>
    </div>
  );
}

function LoadMoreErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      <p className="text-body text-secondary">載入更多失敗，請稍後再試。</p>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRetry}
      >
        重新載入
      </Button>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div
      role="status"
      aria-label="載入中"
      className="flex justify-center py-6"
    >
      <CircleNotch className="size-6 animate-spin text-secondary" />
    </div>
  );
}

function LoadingOrError({
  status,
  onRetry,
}: {
  status: FeedStatus;
  onRetry: () => void;
}) {
  return status === "error" ? (
    <LoadMoreErrorState onRetry={onRetry} />
  ) : (
    <LoadingIndicator />
  );
}

export function ExchangeList({
  apiQuery,
  filterBar,
  filtered,
}: {
  apiQuery: string;
  filterBar: ReactNode;
  /** 目前是否有套用篩選；決定沒資料時顯示哪一種空狀態。 */
  filtered: boolean;
}) {
  return (
    <ExchangeFeed
      // 篩選或排序改變時重新掛載，已載入的資料與展開狀態一起歸零。
      key={apiQuery}
      apiQuery={apiQuery}
      filterBar={filterBar}
      filtered={filtered}
    />
  );
}

function ExchangeFeed({
  apiQuery,
  filterBar,
  filtered,
}: {
  apiQuery: string;
  filterBar: ReactNode;
  filtered: boolean;
}) {
  const { cards, status, hasMore, loadMore, retry } =
    useExchangeInfoFeed(apiQuery);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const isOffline = useIsOffline();

  const listRef = useRef<HTMLUListElement>(null);

  /** 滑到底部 200px 內、或內容還沒填滿可視範圍時，自動載入下一頁。 */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const loadMoreIfNearBottom = () => {
      if (list.scrollHeight - list.scrollTop - list.clientHeight <= 200) {
        loadMore();
      }
    };

    const frame = requestAnimationFrame(loadMoreIfNearBottom);
    list.addEventListener("scroll", loadMoreIfNearBottom, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("scroll", loadMoreIfNearBottom);
    };
  }, [loadMore, expandedCardId]);

  const firstPageSettled = cards.length > 0 || status === "ready";

  if (status === "ready" && cards.length === 0 && !filtered) {
    return (
      <section className="flex min-h-0 flex-1 flex-col gap-5">
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-5">
      {filterBar}

      {!firstPageSettled &&
        (status === "error" ? (
          isOffline ? (
            <ErrorState
              image={<WifiSlash className="size-8 text-error" />}
              title={OFFLINE_ERROR_TITLE}
              description={OFFLINE_ERROR_DESCRIPTION}
              onRetry={retry}
            />
          ) : (
            <ErrorState
              image={
                <Image
                  src="/images/server-error.svg"
                  alt=""
                  width={32}
                  height={32}
                />
              }
              title={LOAD_FAILED_ERROR_TITLE}
              description={LOAD_FAILED_ERROR_DESCRIPTION}
              onRetry={retry}
            />
          )
        ) : (
          <LoadingIndicator />
        ))}

      {status === "ready" && cards.length === 0 && <NoMatchState />}

      {cards.length > 0 && (
        <ul
          ref={listRef}
          aria-busy={status === "loading"}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-24 md:landscape:pr-2 md:landscape:pb-0 lg:pr-2 lg:pb-0"
        >
          {cards.map((card) => (
            <ExchangeCard
              key={card.id}
              card={card}
              expanded={expandedCardId === card.id}
              onToggle={() =>
                setExpandedCardId((currentId) =>
                  currentId === card.id ? null : card.id,
                )
              }
            />
          ))}

          {hasMore && (
            <li className="list-none">
              <LoadingOrError
                status={status}
                onRetry={retry}
              />
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
