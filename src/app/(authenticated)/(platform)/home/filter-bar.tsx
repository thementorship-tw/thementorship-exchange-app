import Link from "next/link";
import { SortAscending, SortDescending } from "@phosphor-icons/react/ssr";

import { Tag } from "@/components/tag";
import { PROFILE_TYPE_LABELS } from "@/shared/profile-types";

import { profileTypes } from "./mock-profiles";
import { buildListHref, type ListParams } from "./list-params";
import { postTypeLabels } from "./posts";

const sortLabels = { newest: "最新的", oldest: "最舊的" } as const;

export function FilterBar({ params }: { params: ListParams }) {
  const { types, sort } = params;
  const SortIcon = sort === "newest" ? SortAscending : SortDescending;

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2">
        <span className="hidden whitespace-nowrap text-body-strong text-secondary md:landscape:inline lg:inline">
          快速篩選
        </span>

        {profileTypes.map((type) => {
          const active = types.includes(type);
          const nextTypes = active
            ? types.filter((value) => value !== type)
            : [...types, type];

          return (
            <Link
              key={type}
              href={buildListHref({ ...params, types: nextTypes })}
              replace
              scroll={false}
              aria-current={active ? "true" : undefined}
              className="rounded-pill focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Tag active={active}>{PROFILE_TYPE_LABELS[type]}</Tag>
            </Link>
          );
        })}
      </div>

      <Link
        href={buildListHref({
          ...params,
          sort: sort === "newest" ? "oldest" : "newest",
        })}
        replace
        scroll={false}
        aria-label={`切換排序，目前為${sortLabels[sort]}`}
        className={`
          relative flex h-7 cursor-pointer items-center gap-1 rounded-pill px-2
          text-body whitespace-nowrap text-secondary
          transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand
          after:absolute after:-inset-x-1 after:-inset-y-2 after:content-['']
        `}
      >
        <SortIcon className="size-5" />
        <span className="hidden md:landscape:inline lg:inline">
          {sortLabels[sort]}
        </span>
      </Link>
    </div>
  );
}
