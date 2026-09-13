import { SortAscending } from "@phosphor-icons/react/ssr";

import { Tag } from "@/components/tag";

import { profileTypes } from "./mock-profiles";
import { postTypeLabels } from "./posts";

/**
 * 快速篩選標籤與排序切換。
 *
 * TODO: 篩選與排序尚未實作。篩選標籤先是不可互動的文字。
 */
export function FilterBar() {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2">
        <span className="hidden whitespace-nowrap text-body-strong text-secondary md:landscape:inline lg:inline">
          快速篩選
        </span>

        {profileTypes.map((type) => (
          <Tag key={type}>{postTypeLabels[type]}</Tag>
        ))}
      </div>

      <button
        type="button"
        aria-label="切換排序，目前為最新的"
        className={`
          relative flex h-7 cursor-pointer items-center gap-1 rounded-pill px-2
          text-body whitespace-nowrap text-secondary
          transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand
          after:absolute after:-inset-x-1 after:-inset-y-2 after:content-['']
        `}
      >
        <SortAscending className="size-5" />
        <span className="hidden md:landscape:inline lg:inline">最新的</span>
      </button>
    </div>
  );
}
