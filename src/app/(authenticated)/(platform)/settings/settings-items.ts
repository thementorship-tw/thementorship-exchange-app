import type { ContactLogView } from "@/server/contact-logs/service";
import type { ContactLogResponse } from "@/shared/api/contact-logs/types";
import type { MyProfileItem } from "@/shared/api/me-profiles/schemas";
import type { ProfileType } from "@/shared/profile-types";
import { formatPostTime } from "@/utils/format";

export type ReceivedApplication = {
  id: string;
  applicantName: string;
  applicantGroup: string;
  requestText: string;
  timeLabel: string;
  offeredResource: string;
  wantedItem: string;
  motivation: string;
  contactInfo: string;
};

export type MyPostStatus = "active" | "delisted";

export type MyPost = {
  id: string;
  type: ProfileType;
  status: MyPostStatus;
  offersText: string;
  wantsText: string;
  description: string;
  timeLabel: string;
  receivedApplications: ReceivedApplication[];
  receivedApplicationTotalPages: number;
};

export type SentApplication = {
  id: string;
  profileAvailability: "available" | "unavailable";
  profileType: ProfileType;
  profileOffersText: string;
  profileWantsText: string;
  profileDescription: string | null;
  recipientName: string;
  recipientGroup: string;
  recipientAvatarUrl: string | null;
  offeredResource: string;
  wantedItem: string;
  motivation: string;
  contactInfo: string;
  timeLabel: string;
};

export function toReceivedApplication(
  log: ContactLogView,
  now = new Date(),
): ReceivedApplication {
  return {
    id: log.id,
    applicantName: log.fromUser.nickname,
    applicantGroup: log.fromUser.group,
    requestText: `申請交換你的「${log.wantedItem}」`,
    timeLabel: formatPostTime(log.createdAt, now),
    offeredResource: log.offeredResource,
    wantedItem: log.wantedItem,
    motivation: log.motivation,
    contactInfo: log.contactInfo,
  };
}

export function toMyPost(item: MyProfileItem, now = new Date()): MyPost {
  return {
    id: item.id,
    type: item.type,
    status: item.status,
    offersText: item.offersText,
    wantsText: item.wantsText,
    description: item.description ?? "",
    timeLabel: formatPostTime(new Date(item.createdAt), now),
    receivedApplications: [],
    receivedApplicationTotalPages: 0,
  };
}

export function toReceivedApplicationFromResponse(
  log: ContactLogResponse,
  now = new Date(),
): ReceivedApplication {
  return {
    id: log.id,
    applicantName: log.fromUser.nickname,
    applicantGroup: log.fromUser.group,
    requestText: `申請交換你的「${log.wantedItem}」`,
    timeLabel: formatPostTime(new Date(log.createdAt), now),
    offeredResource: log.offeredResource,
    wantedItem: log.wantedItem,
    motivation: log.motivation,
    contactInfo: log.contactInfo,
  };
}

export function toSentApplication(
  log: ContactLogView,
  now = new Date(),
): SentApplication {
  return {
    id: log.id,
    profileAvailability: log.profileAvailability,
    profileType: log.profile.type,
    profileOffersText: log.profile.offersText,
    profileWantsText: log.profile.wantsText,
    profileDescription: log.profile.description,
    recipientName: log.toUser.nickname,
    recipientGroup: log.toUser.group,
    recipientAvatarUrl: log.toUser.avatarUrl,
    offeredResource: log.offeredResource,
    wantedItem: log.wantedItem,
    motivation: log.motivation,
    contactInfo: log.contactInfo,
    timeLabel: formatPostTime(log.createdAt, now),
  };
}

export function toSentApplicationFromResponse(
  log: ContactLogResponse,
  now = new Date(),
): SentApplication {
  return {
    id: log.id,
    profileAvailability: log.profileAvailability,
    profileType: log.profile.type,
    profileOffersText: log.profile.offersText,
    profileWantsText: log.profile.wantsText,
    profileDescription: log.profile.description,
    recipientName: log.toUser.nickname,
    recipientGroup: log.toUser.group,
    recipientAvatarUrl: log.toUser.avatarUrl,
    offeredResource: log.offeredResource,
    wantedItem: log.wantedItem,
    motivation: log.motivation,
    contactInfo: log.contactInfo,
    timeLabel: formatPostTime(new Date(log.createdAt), now),
  };
}
