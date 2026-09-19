"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react/ssr";

import { buttonClassName } from "@/components/button";

import { useNotifications } from "../_providers/notification-provider";
import { HomeNav } from "./home-nav";
import { SearchField } from "./search-field";

export function HomeSidebar() {
  const { unreadCount } = useNotifications();

  return (
    <aside className="hidden min-w-0 flex-col md:landscape:flex md:landscape:w-73.5 md:landscape:shrink-0 md:landscape:gap-6 md:landscape:rounded-20 md:landscape:border md:landscape:border-line md:landscape:bg-glass md:landscape:p-6 md:landscape:backdrop-blur-sm lg:flex lg:w-73.5 lg:shrink-0 lg:gap-6 lg:rounded-20 lg:border lg:border-line lg:bg-glass lg:p-6 lg:backdrop-blur-sm">
      <p className="hidden py-2 text-center text-body-strong text-primary md:landscape:block lg:block">
        <Link
          href="/home"
          className="rounded-4 focus-visible:outline-2 focus-visible:outline-brand"
        >
          曼陀號技能交換平台
        </Link>
      </p>

      <div className="flex flex-1 flex-col gap-2">
        <SearchField className="w-full" />
        <HomeNav unreadCount={unreadCount} />
      </div>

      <div className="hidden flex-col gap-6 md:landscape:flex lg:flex">
        <button
          type="button"
          className={buttonClassName({ size: "xl", className: "w-full gap-2" })}
        >
          我要發文
          <Plus
            weight="bold"
            className="size-5"
          />
        </button>
      </div>
    </aside>
  );
}
