"use client";

import { useState } from "react";

import { Toast } from "@/components/toast";

import { readApiError } from "./api-error";
import { DelistPostDialog } from "./delist-post-dialog";
import { EditPostDialog } from "./edit-post-dialog";
import type { MyProfileResponse } from "@/shared/api/me-profiles/schemas";

import type { ExchangePostFormValues } from "../home/exchange-post-form";

import type { MyPost } from "./settings-mock-data";
import { MyPostRow } from "./my-post-row";

export function MyPostList({ initialPosts }: { initialPosts: MyPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [delistPostId, setDelistPostId] = useState<string | null>(null);
  const [editToastOpen, setEditToastOpen] = useState(false);
  const [delistToastOpen, setDelistToastOpen] = useState(false);
  const [delistErrorMessage, setDelistErrorMessage] = useState<
    string | undefined
  >();
  const [delisting, setDelisting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<
    string | undefined
  >();

  const editingPost =
    editPostId === null
      ? null
      : (posts.find((post) => post.id === editPostId) ?? null);

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
        const body = await readApiError(response);
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

  async function confirmEdit(values: ExchangePostFormValues) {
    if (editingPost === null) return;

    setSavingEdit(true);
    try {
      const response = await fetch(`/api/me/profiles/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offersText: values.offersText,
          wantsText: values.wantsText,
          description: values.description || null,
        }),
      });

      if (!response.ok) {
        const body = await readApiError(response);
        setEditErrorMessage(body.error?.message ?? "貼文更新失敗");
        return;
      }

      const { data } = (await response.json()) as MyProfileResponse;
      setPosts((current) =>
        current.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                offersText: data.offersText,
                wantsText: data.wantsText,
                description: data.description ?? "",
              }
            : post,
        ),
      );
      setEditPostId(null);
      setEditToastOpen(true);
    } catch {
      setEditErrorMessage("貼文更新失敗");
    } finally {
      setSavingEdit(false);
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
            onEdit={() => setEditPostId(post.id)}
            onDelist={() => setDelistPostId(post.id)}
          />
        ))}
      </ul>

      {editingPost !== null && (
        <EditPostDialog
          key={editingPost.id}
          post={editingPost}
          open={editPostId !== null}
          onClose={() => {
            if (savingEdit) return;
            setEditPostId(null);
          }}
          saving={savingEdit}
          onSave={(values) => void confirmEdit(values)}
        />
      )}

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
        open={editToastOpen}
        variant="brand"
        placement="homeContent"
        onClose={() => setEditToastOpen(false)}
      >
        貼文已更新
      </Toast>

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

      <Toast
        open={editErrorMessage !== undefined}
        variant="error"
        placement="homeContent"
        onClose={() => setEditErrorMessage(undefined)}
      >
        {editErrorMessage}
      </Toast>
    </>
  );
}
