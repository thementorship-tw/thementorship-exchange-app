"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { Toast } from "@/components/toast";
import { NOTIFICATION_RETENTION_DAYS } from "@/shared/api/contact-logs/constants";

import type { NotificationItem } from "../notifications/notifications";

type NotificationContextValue = {
  notifications: NotificationItem[];
  loadFailed: boolean;
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

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

  const value = useMemo<NotificationContextValue>(() => {
    const unreadCount = notifications.filter(
      ({ readAt }) => readAt === null,
    ).length;

    return {
      notifications,
      loadFailed: initialLoadFailed,
      unreadCount,
      markAsRead: async (id) => {
        const target = notifications.find((item) => item.id === id);
        if (target === undefined || target.readAt !== null) return;

        // optimistic update
        const readAt = new Date();
        setNotifications((current) =>
          current.map((item) => (item.id === id ? { ...item, readAt } : item)),
        );
        try {
          const response = await fetch(`/api/contact-logs/${id}/read`, {
            method: "PATCH",
          });
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
        } catch (error: unknown) {
          // 只回復本次 optimistic update，避免覆蓋其他已成功的已讀狀態。
          setNotifications((current) =>
            current.map((item) =>
              item.id === id && item.readAt?.getTime() === readAt.getTime()
                ? { ...item, readAt: target.readAt }
                : item,
            ),
          );
          setMutationError("已讀狀態更新失敗，請稍後再試");
          console.error("[notifications] Failed to mark as read", error);
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
            `/api/contact-logs/read-all?withinDays=${NOTIFICATION_RETENTION_DAYS}`,
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
