"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Toast } from "@/components/toast";
import type { MeResponse, SettingsProfile } from "@/shared/api/users/schemas";
import { NICKNAME_MAX_LENGTH } from "@/shared/api/users/constants";

import { readApiError } from "./api-error";

export function SettingsProfileHeader({
  profile: initialProfile,
}: {
  profile: SettingsProfile;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialProfile.nickname);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const ignoreBlurSaveRef = useRef(false);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  function startEditing() {
    // Escape 取消時 input 會直接被移除，瀏覽器不會補發 blur，旗標會留在上一輪
    // 的 true；每次進入編輯先歸零，才不會吃掉這一輪的第一次 blur 存檔。
    ignoreBlurSaveRef.current = false;
    setDraft(profile.nickname);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(profile.nickname);
    setEditing(false);
  }

  async function saveNickname() {
    const nextNickname = draft.trim();
    if (nextNickname === profile.nickname) {
      setEditing(false);
      return;
    }

    if (nextNickname.length === 0) {
      setErrorMessage("暱稱不可為空白");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nextNickname }),
      });

      if (!response.ok) {
        const body = await readApiError(response);
        const fieldError = body.error?.fields?.nickname;
        setErrorMessage(fieldError ?? body.error?.message ?? "暱稱更新失敗");
        return;
      }

      const { data } = (await response.json()) as MeResponse;
      setProfile(data);
      setDraft(data.nickname);
      setEditing(false);
    } catch {
      setErrorMessage("暱稱更新失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="flex flex-col gap-4 md:landscape:flex-row md:landscape:items-center lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 py-1">
          {profile.avatarUrl === null ? (
            <span className="size-8 shrink-0 rounded-pill bg-blue-9" />
          ) : (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-pill object-cover"
            />
          )}
          <p className="truncate text-h2 text-primary">{profile.googleName}</p>
          <p className="shrink-0 text-h2 text-gold">{profile.group}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-3 md:landscape:justify-end lg:justify-end">
          <span className="text-body-lg-strong text-secondary">顯示暱稱</span>
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={draft}
              maxLength={NICKNAME_MAX_LENGTH}
              disabled={saving}
              aria-label="顯示暱稱"
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                if (ignoreBlurSaveRef.current) {
                  ignoreBlurSaveRef.current = false;
                  return;
                }
                void saveNickname();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void saveNickname();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  ignoreBlurSaveRef.current = true;
                  cancelEditing();
                }
              }}
              className="min-w-0 max-w-full border-0 bg-transparent p-0 text-body-lg text-primary outline-none focus-visible:outline-none disabled:opacity-60"
            />
          ) : (
            <span className="text-body-lg text-primary">
              {profile.nickname}
            </span>
          )}
          {!editing && (
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={startEditing}
            >
              修改
            </Button>
          )}
        </div>
      </header>

      <Toast
        open={errorMessage !== undefined}
        variant="error"
        onClose={() => setErrorMessage(undefined)}
      >
        {errorMessage}
      </Toast>
    </>
  );
}
