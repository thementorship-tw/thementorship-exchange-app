import type { ContactLogView } from "@/server/contact-logs/service";
import type { MyProfileItem } from "@/shared/api/me-profiles/schemas";
import { formatPostTime } from "@/utils/format";

import type { MyPost, ReceivedApplication } from "./settings-mock-data";

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

export function attachReceivedApplications(
  posts: MyPost[],
  logs: ContactLogView[],
  now = new Date(),
): MyPost[] {
  const byProfileId = new Map<string, ReceivedApplication[]>();

  for (const log of logs) {
    const applications = byProfileId.get(log.profileId) ?? [];
    applications.push(toReceivedApplication(log, now));
    byProfileId.set(log.profileId, applications);
  }

  return posts.map((post) => ({
    ...post,
    receivedApplications: byProfileId.get(post.id) ?? [],
  }));
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
  };
}
