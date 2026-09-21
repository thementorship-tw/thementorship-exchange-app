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

export const MOCK_MY_POSTS: MyPost[] = [
  {
    id: "post-1",
    type: "skillAndInterest",
    status: "active",
    offersText: "程式語言、樂理知識、英文",
    wantsText: "運動教學、hyrox 陪練",
    description: "描述內文",
    timeLabel: "3 天前",
    receivedApplications: [
      {
        id: "app-1",
        applicantName: "Alicia Hen",
        applicantGroup: "PM",
        requestText: "申請交換你的「程式語言」",
        timeLabel: "8 小時前",
        offeredResource: "攝影入門、暗房沖洗",
        wantedItem: "程式語言入門",
        motivation:
          "想從零開始學寫網頁，之前自學過 HTML 但卡在 JavaScript，希望有人可以帶一下。",
        contactInfo: "line alicia_hen",
      },
      {
        id: "app-2",
        applicantName: "Marcus Lin",
        applicantGroup: "BD",
        requestText: "申請交換你的「程式語言」",
        timeLabel: "12 小時前",
        offeredResource: "商務開發、簡報技巧",
        wantedItem: "前端入門",
        motivation: "想更理解工程師在估時時的考量。",
        contactInfo: "marcus@example.com",
      },
    ],
  },
  {
    id: "post-2",
    type: "skillAndInterest",
    status: "active",
    offersText: "程式語言、樂理知識、英文",
    wantsText: "運動教學、hyrox 陪練",
    description:
      "描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文描述內文",
    timeLabel: "3 天前",
    receivedApplications: [],
  },
];
