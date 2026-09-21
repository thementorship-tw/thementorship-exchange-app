import type { ProfileType } from "@/shared/profile-types";

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
};
