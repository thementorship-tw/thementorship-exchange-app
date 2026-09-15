import Link from "next/link";
import { Plus } from "@phosphor-icons/react/ssr";

import { buttonClassName } from "@/components/button";

import { DevSignOutButton } from "./dev-sign-out-button";
import { HomeNav } from "./home-nav";
import { SearchField } from "./search-field";

export function HomeSidebar({
  hasUnreadNotifications = false,
}: {
  /** 系統通知有未讀時，在選項右側顯示小圓點。 */
  hasUnreadNotifications?: boolean;
}) {
  return (
    <aside className="flex min-w-0 flex-col md:landscape:gap-6 md:landscape:rounded-20 md:landscape:border md:landscape:border-line md:landscape:bg-glass md:landscape:p-6 md:landscape:backdrop-blur-sm lg:gap-6 lg:rounded-20 lg:border lg:border-line lg:bg-glass lg:p-6 lg:backdrop-blur-sm">
      <p className="hidden py-2 text-center text-body-strong text-primary md:landscape:block lg:block">
        <Link
          href="/home"
          className="rounded-4 focus-visible:outline-2 focus-visible:outline-brand"
        >
          曼陀號技能交換平台
        </Link>
      </p>

      <div className="flex flex-1 flex-col gap-2">
        <SearchField />

        <div className="hidden md:landscape:block lg:block">
          <HomeNav hasUnreadNotifications={hasUnreadNotifications} />
        </div>
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

        <DevSignOutButton />
      </div>
    </aside>
  );
}
