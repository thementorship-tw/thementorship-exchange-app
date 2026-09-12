import { Bell, Plus, Settings } from "lucide-react";

import { buttonClassName } from "@/components/button";

import { SearchField } from "./search-field";

const navItems = [
  { label: "系統通知", Icon: Bell },
  { label: "設定中心", Icon: Settings },
];

/** 桌機版側欄：站台名稱、搜尋、功能選單與發文按鈕。 */
export function HomeSidebar() {
  return (
    <aside className="hidden w-73.5 shrink-0 flex-col gap-6 rounded-20 border border-line bg-glass p-6 backdrop-blur-sm md:landscape:flex lg:flex">
      <p className="py-2 text-center text-body-strong text-primary">
        曼陀號技能交換平台
      </p>

      <div className="flex flex-1 flex-col gap-2">
        <SearchField />

        {/* CHECK: 系統通知與設定中心頁面尚未實作，先保留入口外觀。 */}
        <nav aria-label="功能選單">
          <ul className="flex flex-col">
            {navItems.map(({ label, Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-12 p-4 text-body-strong text-secondary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* CHECK: 發文流程（Home / Desktop / 02–08）尚未實作。 */}
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
