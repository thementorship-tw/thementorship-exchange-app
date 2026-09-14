import type { ProfileType } from "@/shared/profile-types";

export type NotificationItem = {
  id: string;
  fromUserNickname: string;
  profileType: ProfileType;
  targetType: "profile" | "application";
  targetHref: string;
  readAt: Date | null;
  createdAt: Date;
};

export const notificationTargetLabels: Record<
  NotificationItem["targetType"],
  string
> = {
  profile: "貼文",
  application: "申請",
};

// TODO: 改由後端回傳建立於 10 天內的通知；前端不自行過濾時間。
export const initialNotifications: NotificationItem[] = [
  {
    id: "notification-1",
    fromUserNickname: "Ray Chen",
    profileType: "skillAndInterest",
    targetType: "profile",
    targetHref: "/home",
    readAt: null,
    createdAt: new Date("2026-09-14T02:00:00.000Z"),
  },
  {
    id: "notification-2",
    fromUserNickname: "Ray Chen",
    profileType: "skillAndInterest",
    targetType: "profile",
    targetHref: "/home",
    readAt: null,
    createdAt: new Date("2026-09-14T02:00:00.000Z"),
  },
  {
    id: "notification-3",
    fromUserNickname: "Alicia Hen",
    profileType: "skillAndInterest",
    targetType: "application",
    targetHref: "/home",
    readAt: new Date("2026-09-14T00:00:00.000Z"),
    createdAt: new Date("2026-09-13T16:00:00.000Z"),
  },
  {
    id: "notification-4",
    fromUserNickname: "Rath Caoe",
    profileType: "career",
    targetType: "application",
    targetHref: "/home",
    readAt: new Date("2026-09-14T00:00:00.000Z"),
    createdAt: new Date("2026-09-13T06:00:00.000Z"),
  },
];
