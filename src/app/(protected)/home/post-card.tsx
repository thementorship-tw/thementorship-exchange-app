"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { postTypeLabels, type PostSummary } from "./posts";

/** 交流列表的貼文卡片；有補充說明時可展開。 */
export function PostCard({ post }: { post: PostSummary }) {
  const [expanded, setExpanded] = useState(false);
  const descriptionId = useId();
  const { author, description } = post;
  const expandable = description !== null;

  return (
    <li className="rounded-20 bg-surface p-2">
      <div
        className={`flex flex-col gap-2 rounded-16 p-4 transition-colors md:landscape:p-5 lg:p-5 ${expanded ? "bg-brand-subtle" : "bg-surface-subtle"}`}
      >
        <div className="flex h-6 items-center justify-between gap-2">
          <span className="flex h-6 items-center rounded-pill bg-brand-subtle px-3 text-caption text-brand">
            #{postTypeLabels[post.type]}
          </span>

          {expandable && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={descriptionId}
              aria-label={expanded ? "收合補充說明" : "展開補充說明"}
              onClick={() => setExpanded(!expanded)}
              /* after 偽元素把觸控範圍撐到 44x44，維持視覺上的 24px 圓鈕。 */
              className="relative flex size-6 cursor-pointer items-center justify-center rounded-pill bg-surface text-secondary transition focus-visible:outline-2 focus-visible:outline-brand after:absolute after:-inset-2.5 after:content-['']"
            >
              <ChevronDown
                className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-body-lg-strong text-primary">{post.offersText}</p>
          <p className="text-body-lg-strong text-primary">{post.wantsText}</p>
        </div>
      </div>

      {expandable && expanded && (
        <p
          id={descriptionId}
          className="px-4 pt-3 text-body text-primary md:landscape:px-5 lg:px-5"
        >
          {description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 px-4 py-2 md:landscape:px-5 lg:px-5">
        <div className="flex items-center gap-2">
          {author.avatarUrl === null ? (
            <span className="size-6 shrink-0 rounded-pill bg-blue-9" />
          ) : (
            <Image
              src={author.avatarUrl}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-pill object-cover"
            />
          )}
          <span className="text-body text-primary">{author.nickname}</span>
          {author.jobTitle !== null && (
            <span className="text-body-strong text-gold">
              {author.jobTitle}
            </span>
          )}
        </div>

        <span className="shrink-0 text-body text-secondary">
          {post.timeLabel}
        </span>
      </div>
    </li>
  );
}
