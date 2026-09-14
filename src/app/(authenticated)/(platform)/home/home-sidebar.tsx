"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react/ssr";

import { buttonClassName } from "@/components/button";

import { useNotifications } from "../notifications/notification-context";
import { HomeNav } from "./home-nav";
import { SearchField } from "./search-field";

export function HomeSidebar() {
  const { unreadCount } = useNotifications();

  return (
    <aside className="hidden w-73.5 shrink-0 flex-col gap-6 rounded-20 border border-line bg-glass p-6 backdrop-blur-sm md:landscape:flex lg:flex">
      <p className="py-2 text-center text-body-strong text-primary">
        <Link
          href="/home"
          className="rounded-4 focus-visible:outline-2 focus-visible:outline-brand"
        >
          曼陀號技能交換平台
        </Link>
      </p>

      <div className="flex flex-1 flex-col gap-2">
        <SearchField />

        <HomeNav unreadCount={unreadCount} />
      </div>

      {/* TODO: 尚未實作。 */}
      <button
        type="button"
        className={buttonClassName({ size: "xl", className: "w-full gap-2" })}
      >
        我要發文
        <Plus className="size-5" />
      </button>
    </aside>
  );
}
