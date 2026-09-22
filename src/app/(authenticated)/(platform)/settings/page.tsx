import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FORCE_SIGN_OUT_PATH, requireActiveUser } from "@/auth";
import { listContactLogs } from "@/server/contact-logs/service";
import { findSettingsProfileByUserId } from "@/server/auth/user.repository";
import { listMyExchangeProfiles } from "@/server/exchange-info/exchange-info.repository";
import { serializeMyProfileItem } from "@/server/exchange-info/my-profiles";
import { CONTACT_LOG_DEFAULT_PAGE_SIZE } from "@/shared/api/contact-logs/constants";

import {
  toReceivedApplication,
  toMyPost,
  toSentApplication,
} from "./settings-items";
import { SettingsCenter } from "./settings-center";

export const metadata: Metadata = {
  title: "設定中心｜The Mentorship Exchange",
  description: "管理曼陀號社群帳號與偏好設定。",
};

export default async function SettingsPage({
  searchParams,
}: PageProps<"/settings">) {
  const { tab, profileId, applicationId } = await searchParams;
  const { user } = await requireActiveUser("/settings");

  const profile = await findSettingsProfileByUserId(user.id);
  if (profile === null) {
    redirect(FORCE_SIGN_OUT_PATH);
  }

  const [rows, { logs: sentLogs, totalItems: sentTotalItems }] =
    await Promise.all([
      listMyExchangeProfiles(user.id),
      listContactLogs({
        userId: user.id,
        direction: "sent",
        page: 1,
        pageSize: CONTACT_LOG_DEFAULT_PAGE_SIZE,
        unreadOnly: false,
      }),
    ]);

  const receivedResults = await Promise.all(
    rows.map(async (row) => {
      if (!row.visible) return { logs: [], totalItems: 0 };
      return listContactLogs({
        userId: user.id,
        direction: "received",
        profileId: row.id,
        page: 1,
        pageSize: CONTACT_LOG_DEFAULT_PAGE_SIZE,
        unreadOnly: false,
      });
    }),
  );

  const initialPosts = rows.map((row, index) => {
    const received = receivedResults[index];
    return {
      ...toMyPost(serializeMyProfileItem(row)),
      receivedApplications: (received?.logs ?? []).map((log) =>
        toReceivedApplication(log),
      ),
      receivedApplicationTotalPages: Math.ceil(
        (received?.totalItems ?? 0) / CONTACT_LOG_DEFAULT_PAGE_SIZE,
      ),
    };
  });
  const initialSentApplications = sentLogs.map((log) => toSentApplication(log));
  const initialActiveTab =
    tab === "sentApplications" ? "sentApplications" : "posts";
  const targetProfileId = typeof profileId === "string" ? profileId : undefined;
  const targetApplicationId =
    typeof applicationId === "string" ? applicationId : undefined;

  return (
    <SettingsCenter
      key={`${initialActiveTab}:${targetProfileId ?? ""}:${targetApplicationId ?? ""}`}
      profile={profile}
      initialPosts={initialPosts}
      initialSentApplications={initialSentApplications}
      initialSentTotalPages={Math.ceil(
        sentTotalItems / CONTACT_LOG_DEFAULT_PAGE_SIZE,
      )}
      initialActiveTab={initialActiveTab}
      targetProfileId={targetProfileId}
      targetApplicationId={targetApplicationId}
    />
  );
}
