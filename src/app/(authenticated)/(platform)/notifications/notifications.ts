import type { ContactLogView } from "@/server/contact-logs/service";
import type { ContactLogResponse } from "@/shared/api/contact-logs/types";
import { buildContactLogTargetHref } from "@/shared/contact-log-target";
import type { ProfileType } from "@/shared/profile-types";

export type NotificationItem = {
  id: string;
  fromUserNickname: string;
  profileType: ProfileType;
  targetHref: string;
  readAt: Date | null;
  createdAt: Date;
};

/** 通知目前唯一的來源：收到「我想聊」申請。 */
export function toNotificationItem(log: ContactLogView): NotificationItem {
  return {
    id: log.id,
    fromUserNickname: log.fromUser.nickname,
    profileType: log.profile.type,
    targetHref: buildContactLogTargetHref({
      profileId: log.profileId,
      applicationId: log.id,
    }),
    readAt: log.readAt,
    createdAt: log.createdAt,
  };
}

/** 與 toNotificationItem 相同的對應，但輸入是 client fetch 拿到的 JSON（日期為 ISO 字串）。 */
export function notificationItemFromResponse(
  log: ContactLogResponse,
): NotificationItem {
  return {
    id: log.id,
    fromUserNickname: log.fromUser.nickname,
    profileType: log.profile.type,
    targetHref: buildContactLogTargetHref({
      profileId: log.profileId,
      applicationId: log.id,
    }),
    readAt: log.readAt === null ? null : new Date(log.readAt),
    createdAt: new Date(log.createdAt),
  };
}
