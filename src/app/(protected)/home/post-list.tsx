"use client";

import { useState } from "react";

import { FilterBar } from "./filter-bar";
import { PostCard } from "./post-card";
import type { PostSummary } from "./posts";

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 text-center">
      <p className="text-body-lg-strong text-primary">還沒有人發文</p>
      <p className="text-body text-secondary">
        目前還沒有任何交換貼文。想交換的就自己先發文吧，第一個發文的人最容易被看見。
      </p>
    </div>
  );
}

export function PostList({ posts }: { posts: PostSummary[] }) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-5">
      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FilterBar />

          <ul className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-24 md:landscape:pb-0 lg:pb-0">
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
          </ul>
        </>
      )}
    </section>
  );
}
