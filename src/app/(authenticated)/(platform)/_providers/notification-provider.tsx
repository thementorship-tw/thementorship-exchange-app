"use client";

import { createContext, useContext, useMemo, useState } from "react";

import {
  initialNotifications,
  type NotificationItem,
} from "../notifications/notifications";

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const value = useMemo<NotificationContextValue>(() => {
    const markReadAt = () => new Date();

    return {
      notifications,
      unreadCount: notifications.filter(({ readAt }) => readAt === null).length,
      markAsRead: (id) =>
        setNotifications((current) =>
          current.map((item) =>
            item.id === id && item.readAt === null
              ? { ...item, readAt: markReadAt() }
              : item,
          ),
        ),
      markAllAsRead: () =>
        setNotifications((current) => {
          const readAt = markReadAt();
          return current.map((item) =>
            item.readAt === null ? { ...item, readAt } : item,
          );
        }),
    };
  }, [notifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
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
