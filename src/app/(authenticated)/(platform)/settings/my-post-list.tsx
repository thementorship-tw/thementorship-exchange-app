"use client";

import { useState } from "react";

import { Toast } from "@/components/toast";

import { DelistPostDialog } from "./delist-post-dialog";
import { MOCK_MY_POSTS, type MyPost } from "./settings-mock-data";
import { MyPostRow } from "./my-post-row";

export function MyPostList({
  initialPosts = MOCK_MY_POSTS,
}: {
  initialPosts?: MyPost[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [delistPostId, setDelistPostId] = useState<string | null>(null);
  const [delistToastOpen, setDelistToastOpen] = useState(false);

  function confirmDelist() {
    if (delistPostId === null) return;

    setPosts((current) =>
      current.map((post) =>
        post.id === delistPostId ? { ...post, status: "delisted" } : post,
      ),
    );
    setDelistPostId(null);
    setDelistToastOpen(true);
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
          />
        ))}
      </ul>

      <DelistPostDialog
        open={delistPostId !== null}
        onClose={() => setDelistPostId(null)}
        onConfirm={confirmDelist}
      />

      <Toast
        open={delistToastOpen}
        variant="brand"
        placement="homeContent"
        onClose={() => setDelistToastOpen(false)}
      >
        貼文已下架
      </Toast>
    </>
  );
}
