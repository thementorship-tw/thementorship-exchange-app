import type { MyProfileItem } from "@/shared/api/me-profiles/schemas";
import { formatPostTime } from "@/utils/format";

import type { MyPost } from "./settings-mock-data";

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
