import type { ContactLogView } from "@/server/contact-logs/service";
import type { ProfileType } from "@/shared/profile-types";

export type NotificationItem = {
  id: string;
  fromUserNickname: string;
  profileType: ProfileType;
  targetHref: string;
  readAt: Date | null;
  createdAt: Date;
};

/** 通知目前唯一的來源：收到「我想聊」申請。還沒有獨立的 detail 頁，先固定指回 /home。 */
export function toNotificationItem(log: ContactLogView): NotificationItem {
  return {
    id: log.id,
    fromUserNickname: log.fromUser.nickname,
    profileType: log.profile.type,
    targetHref: "/home",
    readAt: log.readAt,
    createdAt: log.createdAt,
  };
}
