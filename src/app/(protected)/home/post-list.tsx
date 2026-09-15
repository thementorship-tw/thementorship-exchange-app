"use client";

import { useInfiniteScroll } from "@reactuses/core";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/button";

import { PostCard } from "./post-card";
import { useExchangeInfoFeed } from "./use-exchange-info-feed";

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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      {/* TODO: 確認文案 */}
      <p className="text-body text-secondary">貼文載入失敗，請稍後再試。</p>
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

function LoadingState() {
  return (
    <p
      role="status"
      className="py-6 text-center text-body text-secondary"
    >
      載入中…
    </p>
  );
}

export function PostList({
  apiQuery,
  filterBar,
  filtered,
}: {
  /** 傳給 /api/exchange-info 的查詢字串，不含 cursor。 */
  apiQuery: string;
  /** 由 server 端渲染的篩選列。 */
  filterBar: ReactNode;
  /** 目前是否有套用篩選；決定沒資料時顯示哪一種空狀態。 */
  filtered: boolean;
}) {
  return (
    <PostFeed
      // 篩選或排序改變時重新掛載，已載入的資料與展開狀態一起歸零。
      key={apiQuery}
      apiQuery={apiQuery}
      filterBar={filterBar}
      filtered={filtered}
    />
  );
}

function PostFeed({
  apiQuery,
  filterBar,
  filtered,
}: {
  apiQuery: string;
  filterBar: ReactNode;
  filtered: boolean;
}) {
  const { posts, status, hasMore, loadMore, retry } =
    useExchangeInfoFeed(apiQuery);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const listRef = useRef<HTMLUListElement>(null);

  useInfiniteScroll(
    listRef,
    ([, , , arrived]) => {
      if (arrived.bottom) loadMore();
    },
    { distance: 200 },
  );

  useEffect(() => {
    if (!hasMore || status !== "ready") return;
    const frame = requestAnimationFrame(() => {
      const list = listRef.current;
      if (
        list &&
        list.scrollHeight - list.scrollTop - list.clientHeight <= 200
      ) {
        loadMore();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hasMore, status, loadMore, expandedPostId]);

  const firstPageSettled = posts.length > 0 || status === "ready";

  if (status === "ready" && posts.length === 0 && !filtered) {
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
          <ErrorState onRetry={retry} />
        ) : (
          <LoadingState />
        ))}

      {status === "ready" && posts.length === 0 && <NoMatchState />}

      {posts.length > 0 && (
        <ul
          ref={listRef}
          aria-busy={status === "loading"}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-24 md:landscape:pr-2 md:landscape:pb-0 lg:pr-2 lg:pb-0"
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              expanded={expandedPostId === post.id}
              onToggle={() =>
                setExpandedPostId((currentId) =>
                  currentId === post.id ? null : post.id,
                )
              }
            />
          ))}

          {hasMore && (
            <li className="list-none">
              {status === "error" ? (
                <ErrorState onRetry={retry} />
              ) : (
                <LoadingState />
              )}
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
