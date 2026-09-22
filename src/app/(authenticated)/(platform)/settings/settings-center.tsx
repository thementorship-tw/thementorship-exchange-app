"use client";

import { ArrowLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useState } from "react";

import type { SettingsProfile } from "@/shared/api/users/schemas";

import { MyPostList } from "./my-post-list";
import { SentApplicationList } from "./sent-application-list";
import type { MyPost, SentApplication } from "./settings-items";
import { SettingsProfileHeader } from "./settings-profile-header";
import { SettingsTabs, type SettingsTab } from "./settings-tabs";

export function SettingsCenter({
  profile,
  initialPosts,
  initialSentApplications,
  initialSentTotalPages,
}: {
  profile: SettingsProfile;
  initialPosts: MyPost[];
  initialSentApplications: SentApplication[];
  initialSentTotalPages: number;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("posts");

  return (
    <section className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-6 md:px-0 md:landscape:pt-2 md:landscape:pb-0 lg:pt-2 lg:pb-0">
      <div className="mb-7 flex items-center md:landscape:hidden lg:hidden">
        <Link
          href="/home"
          className="flex min-h-11 items-center gap-3 rounded-8 px-2 text-body-lg-strong text-primary transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none"
        >
          <ArrowLeft className="size-6" />
          返回
        </Link>
      </div>

      <div className="mb-6 md:landscape:mb-8 lg:mb-8">
        <SettingsProfileHeader profile={profile} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <SettingsTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div
          role="tabpanel"
          id="settings-tabpanel-posts"
          aria-labelledby="settings-tab-posts"
          hidden={activeTab !== "posts"}
          className="flex min-h-0 flex-1 flex-col pt-2"
        >
          <MyPostList initialPosts={initialPosts} />
        </div>

        <div
          role="tabpanel"
          id="settings-tabpanel-sentApplications"
          aria-labelledby="settings-tab-sentApplications"
          hidden={activeTab !== "sentApplications"}
          className="flex min-h-0 flex-1 flex-col pt-2"
        >
          <SentApplicationList
            active={activeTab === "sentApplications"}
            initialApplications={initialSentApplications}
            initialTotalPages={initialSentTotalPages}
          />
        </div>
      </div>
    </section>
  );
}
