import { requireActiveUser } from "@/auth";
import { OceanScene } from "@/components/ocean-scene";
import { listContactLogs } from "@/server/contact-logs/service";
import {
  CONTACT_LOG_MAX_PAGE_SIZE,
  NOTIFICATION_RETENTION_DAYS,
} from "@/shared/api/contact-logs/constants";

import { HomeSidebar } from "./home/home-sidebar";
import { NotificationProvider } from "./_providers/notification-provider";
import { toNotificationItem } from "./notifications/notifications";
import type { NotificationItem } from "./notifications/notifications";

export default async function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireActiveUser();
  let initialNotifications: NotificationItem[] = [];
  let notificationLoadFailed = false;

  try {
    const { logs } = await listContactLogs({
      userId: user.id,
      direction: "received",
      page: 1,
      pageSize: CONTACT_LOG_MAX_PAGE_SIZE,
      unreadOnly: false,
      withinDays: NOTIFICATION_RETENTION_DAYS,
    });
    // 資料離開 server 前先縮減成通知需要的欄位，不將 contactInfo 等敏感內容送到 client。
    initialNotifications = logs.map(toNotificationItem);
  } catch (error: unknown) {
    notificationLoadFailed = true;
    console.error("[notifications] Failed to load notifications", error);
  }

  return (
    <main className="relative isolate flex h-dvh flex-col overflow-hidden bg-page">
      <OceanScene boatSide="left" />

      <NotificationProvider
        initialLoadFailed={notificationLoadFailed}
        initialNotifications={initialNotifications}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-360 flex-1 flex-col md:px-6 md:landscape:flex-row md:landscape:gap-6 md:landscape:py-6 lg:flex-row lg:gap-6 lg:px-6 lg:py-6 xl:px-20">
          <HomeSidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </NotificationProvider>
    </main>
  );
}
