"use client";

import { ArrowLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useState } from "react";

import type { SettingsProfile } from "@/shared/api/users/schemas";

import { MyPostList } from "./my-post-list";
import { SettingsProfileHeader } from "./settings-profile-header";
import { SettingsTabs, type SettingsTab } from "./settings-tabs";

export function SettingsCenter({ profile }: { profile: SettingsProfile }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("posts");

  return (
    <section className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-6 md:px-0 md:landscape:pt-2 lg:pt-2">
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
          className="flex min-h-0 flex-1 flex-col pt-2"
        >
          {activeTab === "posts" ? (
            <MyPostList />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-20 bg-glass px-6 py-12 text-body text-secondary">
              即將推出
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
