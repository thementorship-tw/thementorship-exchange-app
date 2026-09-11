import { MenuIcon } from "@/components/icons";

import { SearchField } from "./search-field";

/** 手機版頁首：漢堡選單、站台名稱與搜尋。桌機改由側欄承接。 */
export function MobileHeader() {
  return (
    <header className="flex flex-col gap-4 px-4 pt-3 pb-2 md:landscape:hidden lg:hidden">
      <div className="flex items-center gap-6">
        {/* CHECK: 側邊選單抽屜尚未實作，先保留入口外觀；觸控範圍維持 44x44。 */}
        <button
          type="button"
          aria-label="開啟選單"
          className="-m-2.5 flex size-11 cursor-pointer items-center justify-center rounded-12 text-primary focus-visible:outline-2 focus-visible:outline-brand"
        >
          <MenuIcon className="size-6" />
        </button>
        <p className="flex-1 text-body-strong text-primary">
          曼陀號技能交換平台
        </p>
      </div>

      <SearchField />
    </header>
  );
}
