import type { Metadata } from "next";

import { NotificationCenter } from "./notification-center";

export const metadata: Metadata = {
  title: "系統通知｜The Mentorship Exchange",
  description: "查看曼陀號社群的系統通知。",
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}
