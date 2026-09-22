"use client";

import { useState } from "react";

import { Toast } from "@/components/toast";

import { DelistPostDialog } from "./delist-post-dialog";
import type { MyPost } from "./settings-items";
import { MyPostRow } from "./my-post-row";

type ApiErrorBody = {
  error?: { message?: string };
};

export function MyPostList({
  initialPosts,
  targetProfileId,
  targetApplicationId,
}: {
  initialPosts: MyPost[];
  targetProfileId?: string;
  targetApplicationId?: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [delistPostId, setDelistPostId] = useState<string | null>(null);
  const [delistToastOpen, setDelistToastOpen] = useState(false);
  const [delistErrorMessage, setDelistErrorMessage] = useState<
    string | undefined
  >();
  const [delisting, setDelisting] = useState(false);

  async function confirmDelist() {
    if (delistPostId === null) return;

    setDelisting(true);
    try {
      const response = await fetch(`/api/me/profiles/${delistPostId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: false }),
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorBody;
        setDelistErrorMessage(body.error?.message ?? "貼文下架失敗");
        return;
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === delistPostId ? { ...post, status: "delisted" } : post,
        ),
      );
      setDelistPostId(null);
      setDelistToastOpen(true);
    } catch {
      setDelistErrorMessage("貼文下架失敗");
    } finally {
      setDelisting(false);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-20 bg-glass px-6 py-12 text-body text-secondary">
        尚無發文
      </div>
    );
  }

  return (
    <>
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {posts.map((post) => (
          <MyPostRow
            key={post.id}
            post={post}
            menuOpen={openMenuPostId === post.id}
            onMenuOpenChange={(open) =>
              setOpenMenuPostId(open ? post.id : null)
            }
            onDelist={() => setDelistPostId(post.id)}
            targetApplicationId={
              post.id === targetProfileId ? targetApplicationId : undefined
            }
          />
        ))}
      </ul>

      <DelistPostDialog
        open={delistPostId !== null}
        confirming={delisting}
        onClose={() => {
          if (delisting) return;
          setDelistPostId(null);
        }}
        onConfirm={() => void confirmDelist()}
      />

      <Toast
        open={delistToastOpen}
        variant="brand"
        placement="homeContent"
        onClose={() => setDelistToastOpen(false)}
      >
        貼文已下架
      </Toast>

      <Toast
        open={delistErrorMessage !== undefined}
        variant="error"
        onClose={() => setDelistErrorMessage(undefined)}
      >
        {delistErrorMessage}
      </Toast>
    </>
  );
}
