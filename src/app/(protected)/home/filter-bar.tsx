import Link from "next/link";

import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check } from "lucide-react";

import { profileTypes } from "@/db/schema";

import { buildListHref, type ListParams } from "./list-params";
import { LinkPending } from "./link-pending";
import { postTypeLabels } from "./posts";

const sortLabels = {
  newest: "最新的",
  oldest: "最舊的",
} as const;

const tagClasses = {
  base: "relative flex h-8 items-center gap-1.5 overflow-hidden rounded-pill border px-4 text-body-strong whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-brand",
  default: "border-line bg-surface text-primary hover:bg-surface-subtle",
  selected: "border-brand bg-brand text-inverse",
};

/** 快速篩選標籤與排序切換；狀態放在網址上，兩者都是連結。 */
export function FilterBar({ params }: { params: ListParams }) {
  const nextOrder = params.order === "newest" ? "oldest" : "newest";
  const SortIcon =
    params.order === "newest" ? ArrowDownWideNarrow : ArrowUpNarrowWide;

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2">
        <span className="hidden whitespace-nowrap text-body-strong text-secondary md:landscape:inline lg:inline">
          快速篩選
        </span>

        {profileTypes.map((type) => {
          const active = params.types.includes(type);
          const nextTypes = active
            ? params.types.filter((value) => value !== type)
            : [...params.types, type];

          return (
            <Link
              key={type}
              href={buildListHref({ ...params, types: nextTypes })}
              prefetch={false}
              aria-current={active ? "true" : undefined}
              className={`${tagClasses.base} ${active ? tagClasses.selected : tagClasses.default}`}
            >
              {postTypeLabels[type]}
              {active && <Check className="size-4" />}
              <LinkPending />
            </Link>
          );
        })}
      </div>

      <Link
        href={buildListHref({ ...params, order: nextOrder })}
        prefetch={false}
        aria-label={`切換排序，目前為${sortLabels[params.order]}`}
        className="relative flex h-7 items-center gap-1 overflow-hidden rounded-pill px-2 text-body whitespace-nowrap text-secondary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
      >
        <SortIcon className="size-5" />
        <span className="hidden md:landscape:inline lg:inline">
          {sortLabels[params.order]}
        </span>
        <LinkPending />
      </Link>
    </div>
  );
}
