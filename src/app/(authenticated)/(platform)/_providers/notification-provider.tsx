"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Toast } from "@/components/toast";
import { NOTIFICATION_RETENTION_DAYS } from "@/shared/api/contact-logs/constants";
import type { ContactLogResponse } from "@/shared/api/contact-logs/types";
import { withBasePath } from "@/shared/base-path";

import { notificationItemFromResponse } from "../notifications/notifications";
import type { NotificationItem } from "../notifications/notifications";
import {
  enablePushNotifications,
  listenForForegroundMessages,
  registerFirebaseServiceWorker,
  reregisterPushTokenIfGranted,
} from "./push-client";

type NotificationContextValue = {
  notifications: NotificationItem[];
  loadFailed: boolean;
  unreadCount: number;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<void>;
  enablePushNotifications: () => Promise<boolean>;
};

/**
 * 合併背景重新整理拿到的資料：保留本地已經標成已讀的樂觀更新（避免 PATCH
 * 還沒完成時被 refetch 蓋回未讀），並補上尚未出現在本地清單的新紀錄。
 */
function mergeNotifications(
  current: NotificationItem[],
  fetched: NotificationItem[],
): NotificationItem[] {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const incoming of fetched) {
    const existing = byId.get(incoming.id);
    byId.set(incoming.id, {
      ...incoming,
      readAt: existing?.readAt ?? incoming.readAt,
    });
  }
  return Array.from(byId.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function NotificationProvider({
  children,
  initialLoadFailed,
  initialNotifications,
}: {
  children: React.ReactNode;
  initialLoadFailed: boolean;
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const refetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        withBasePath(
          `/api/contact-logs?role=received&withinDays=${NOTIFICATION_RETENTION_DAYS}`,
        ),
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const { data } = (await response.json()) as {
        data: ContactLogResponse[];
      };
      // 合併背景重新整理拿到的資料：保留本地已經標成已讀的樂觀更新（避免 PATCH 還沒完成時被 refetch 蓋回未讀），並補上尚未出現在本地清單的新紀錄。
      setNotifications((current) =>
        mergeNotifications(current, data.map(notificationItemFromResponse)),
      );
    } catch (error: unknown) {
      // 背景補資料失敗不打擾使用者，只記錄；下次 focus/前景推播再試一次。
      console.error("[notifications] Failed to refetch notifications", error);
    }
  }, []);

  // FCM + Browser lifecycle 的監聽機制
  useEffect(() => {
    void registerFirebaseServiceWorker().catch((error: unknown) => {
      console.error("[push] Failed to register service worker", error);
    }); // 確保 Firebase 使用的 Service Worker 已經向 Browser 註冊
    void reregisterPushTokenIfGranted().catch((error: unknown) => {
      console.error("[push] Failed to re-register push token", error);
    }); // 確保已經授權的使用者的 FCM token 已經向後端註冊

    let disposed = false;
    let unsubscribe: (() => void) | undefined; // 保存 FCM listener 的取消函式
    // 當網站目前在前景，而且收到 FCM message，就執行這個 callback。
    void listenForForegroundMessages(() => {
      void refetchNotifications(); // FCM message 只是一個「有新通知」的 signal，實際的通知資料還是要向後端重新抓，資料庫才是真正資料來源。
    })
      .then((unsub) => {
        if (disposed) {
          unsub();
          return;
        }
        unsubscribe = unsub;
      })
      .catch((error: unknown) => {
        console.error("[push] Failed to listen for foreground messages", error);
      });

    // 跟 FCM 無關：使用者重新回到網站時，也同步一次通知。
    const onFocusOrVisible = () => {
      if (document.visibilityState === "hidden") return;
      void refetchNotifications();
    };
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      disposed = true;
      unsubscribe?.();
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [refetchNotifications]);

  const value = useMemo<NotificationContextValue>(() => {
    const unreadCount = notifications.filter(
      ({ readAt }) => readAt === null,
    ).length;

    return {
      notifications,
      loadFailed: initialLoadFailed,
      unreadCount,
      markAsRead: async (id) => {
        // target 可能是 undefined：這筆申請不在通知中心目前載入的範圍內
        // （超過 30 天保留期或第一頁上限），例如從「我的發文」直接展開
        // 一筆較舊的申請時。這種情況一樣要打 PATCH，只是沒有本地通知
        // list 可以做 optimistic update。
        const target = notifications.find((item) => item.id === id);
        if (target !== undefined && target.readAt !== null) return true;

        const readAt = new Date();
        if (target !== undefined) {
          setNotifications((current) =>
            current.map((item) =>
              item.id === id ? { ...item, readAt } : item,
            ),
          );
        }
        try {
          const response = await fetch(
            withBasePath(`/api/contact-logs/${id}/read`),
            { method: "PATCH" },
          );
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          return true;
        } catch (error: unknown) {
          if (target !== undefined) {
            // 只回復本次 optimistic update，避免覆蓋其他已成功的已讀狀態。
            setNotifications((current) =>
              current.map((item) =>
                item.id === id && item.readAt?.getTime() === readAt.getTime()
                  ? { ...item, readAt: target.readAt }
                  : item,
              ),
            );
          }
          setMutationError("已讀狀態更新失敗，請稍後再試");
          console.error("[notifications] Failed to mark as read", error);
          return false;
        }
      },
      markAllAsRead: async () => {
        if (unreadCount === 0) return;

        const readAt = new Date();
        const unreadIds = new Set(
          notifications
            .filter((item) => item.readAt === null)
            .map((item) => item.id),
        );
        setNotifications((current) =>
          current.map((item) =>
            item.readAt === null ? { ...item, readAt } : item,
          ),
        );

        try {
          const response = await fetch(
            withBasePath(
              `/api/contact-logs/read-all?withinDays=${NOTIFICATION_RETENTION_DAYS}`,
            ),
            { method: "PATCH" },
          );
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
        } catch (error: unknown) {
          setNotifications((current) =>
            current.map((item) =>
              unreadIds.has(item.id) &&
              item.readAt?.getTime() === readAt.getTime()
                ? { ...item, readAt: null }
                : item,
            ),
          );
          setMutationError("全部已讀更新失敗，請稍後再試");
          console.error("[notifications] Failed to mark all as read", error);
        }
      },
      enablePushNotifications,
    };
  }, [initialLoadFailed, notifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toast
        open={mutationError !== null}
        variant="error"
        onClose={() => setMutationError(null)}
      >
        {mutationError}
      </Toast>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }
  return context;
}
