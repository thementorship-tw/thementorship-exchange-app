import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FORCE_SIGN_OUT_PATH, requireActiveUser } from "@/auth";
import { listContactLogs } from "@/server/contact-logs/service";
import { findSettingsProfileByUserId } from "@/server/auth/user.repository";
import { listMyExchangeProfiles } from "@/server/exchange-info/exchange-info.repository";
import { serializeMyProfileItem } from "@/server/exchange-info/my-profiles";
import {
  CONTACT_LOG_MAX_PAGE_SIZE,
  NOTIFICATION_RETENTION_DAYS,
} from "@/shared/api/contact-logs/constants";

import { attachReceivedApplications, toMyPost } from "./my-posts";
import { SettingsCenter } from "./settings-center";

export const metadata: Metadata = {
  title: "設定中心｜The Mentorship Exchange",
  description: "管理曼陀號社群帳號與偏好設定。",
};

export default async function SettingsPage() {
  const { user } = await requireActiveUser("/settings");
  const profile = await findSettingsProfileByUserId(user.id);

  if (profile === null) {
    redirect(FORCE_SIGN_OUT_PATH);
  }

  const [rows, { logs }] = await Promise.all([
    listMyExchangeProfiles(user.id),
    listContactLogs({
      userId: user.id,
      direction: "received",
      page: 1,
      pageSize: CONTACT_LOG_MAX_PAGE_SIZE,
      unreadOnly: false,
      withinDays: NOTIFICATION_RETENTION_DAYS,
    }),
  ]);
  const initialPosts = attachReceivedApplications(
    rows.map((row) => toMyPost(serializeMyProfileItem(row))),
    logs,
  );

  return (
    <SettingsCenter
      profile={profile}
      initialPosts={initialPosts}
    />
  );
}
