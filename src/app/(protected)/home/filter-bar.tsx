import { ArrowDownWideNarrow } from "lucide-react";

import { Tag } from "@/components/tag";

import { profileTypes } from "./mock-profiles";
import { postTypeLabels } from "./posts";

/**
 * 快速篩選標籤與排序切換。
 *
 * TODO: 篩選與排序尚未實作，這裡都是不可互動的文字，不做成連結或按鈕。
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

      <span className="flex h-7 items-center gap-1 rounded-pill px-2 text-body whitespace-nowrap text-secondary">
        <ArrowDownWideNarrow className="size-5" />
        <span className="hidden md:landscape:inline lg:inline">最新的</span>
      </span>
    </div>
  );
}
