"use client";

import { ArrowLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { DataLoadError } from "@/components/data-load-error";
import { PROFILE_TYPE_LABELS } from "@/shared/profile-types";
import { formatPostTime } from "@/utils/format";

import { useNotifications } from "../_providers/notification-provider";
import type { NotificationItem } from "./notifications";

type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

function subscribeToNothing() {
  // `Notification.permission` 沒有變更事件，只需要在 mount 後讀取一次正確值。
  return () => {};
}

function getPushPermissionSnapshot(): PushPermissionState {
  return typeof Notification === "undefined"
    ? "unsupported"
    : Notification.permission;
}

/**
 * 用 useSyncExternalStore 而不是 useEffect + setState，避免 SSR 階段（沒有
 * `Notification` 全域）跟 client 第一次 render 的結果不一致。
 */
function usePushPermissionState(): PushPermissionState {
  return useSyncExternalStore(
    subscribeToNothing,
    getPushPermissionSnapshot,
    () => "unsupported" as const,
  );
}

function EnablePushButton() {
  const { enablePushNotifications } = useNotifications();
  const permission = usePushPermissionState();
  const [pending, setPending] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);

  if (permission === "unsupported") return null;

  if (permission === "granted" || justEnabled) {
    return <span className="text-body text-secondary">推播通知已開啟</span>;
  }

  if (permission === "denied") {
    return (
      <span className="text-body text-secondary">
        通知已被瀏覽器封鎖，請至網站設定重新開啟
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setPending(true);
        const enabled = await enablePushNotifications();
        setPending(false);
        setJustEnabled(enabled);
      }}
      disabled={pending}
      className="min-h-9 shrink-0 cursor-pointer rounded-pill border border-line bg-surface px-4 text-body-strong text-primary transition-colors hover:bg-surface-subtle disabled:cursor-default disabled:opacity-60 focus-visible:bg-surface-subtle focus-visible:outline-none"
    >
      {pending ? "開啟中…" : "開啟推播通知"}
    </button>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const { markAsRead } = useNotifications();
  const unread = item.readAt === null;
  const profileTypeLabel = PROFILE_TYPE_LABELS[item.profileType];
  const timeLabel = formatPostTime(item.createdAt, new Date());

  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        href={item.targetHref}
        onClick={() => markAsRead(item.id)}
        className="group relative flex min-h-24 items-start gap-3 px-5 py-5 transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none md:landscape:px-4 lg:px-4"
        aria-label={`${item.fromUserNickname} 想和你交換${profileTypeLabel}，${timeLabel}${unread ? "，未讀" : "，已讀"}`}
      >
        <span
          aria-hidden="true"
          className="mt-1 size-6 shrink-0 rounded-pill bg-brand"
        />

        <span className="min-w-0 flex-1">
          <span
            className={`block text-body-lg ${unread ? "text-brand" : "text-primary"}`}
          >
            {item.fromUserNickname} 想和你交換「{profileTypeLabel}
            」，快去看看他的申請。
          </span>
          <span className="mt-0.5 block text-body text-secondary">
            {timeLabel}
          </span>
        </span>

        {unread && (
          <span
            aria-hidden="true"
            className="mt-1.5 size-2 shrink-0 rounded-pill bg-gold-strong"
          />
        )}
      </Link>
    </li>
  );
}

export function NotificationCenter() {
  const { loadFailed, notifications, unreadCount, markAllAsRead } =
    useNotifications();

  return (
    <section className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-6 md:px-0 md:landscape:pt-2 lg:pt-2">
      <div className="mb-7 flex items-center md:landscape:hidden lg:hidden">
        <Link
          href="/home"
          className="flex min-h-11 items-center gap-3 rounded-8 px-2 text-body-lg-strong text-primary transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none"
        >
          <ArrowLeft className="size-6" />
          返回
        </Link>
      </div>

      {loadFailed ? (
        <DataLoadError className="flex-1" />
      ) : (
        <>
          <header className="mb-4 flex items-center justify-between gap-4 md:landscape:mb-5 lg:mb-5">
            <h1 className="text-body-strong text-secondary">
              {unreadCount > 0
                ? `你有未讀通知 (${unreadCount})`
                : "目前沒有新通知"}
            </h1>
            <div className="flex shrink-0 items-center gap-3">
              <EnablePushButton />
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="min-h-9 shrink-0 cursor-pointer rounded-pill border border-line bg-surface px-4 text-body-strong text-primary transition-colors hover:bg-surface-subtle disabled:cursor-default disabled:opacity-60 focus-visible:bg-surface-subtle focus-visible:outline-none"
              >
                已讀全部
              </button>
            </div>
          </header>

          {notifications.length === 0 ? (
            <div className="rounded-20 bg-surface px-6 py-12 text-center text-body text-secondary">
              目前還沒有任何通知。
            </div>
          ) : (
            <ul className="min-h-0 overflow-y-auto rounded-20 bg-surface md:landscape:rounded-20 lg:rounded-20">
              {notifications.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
