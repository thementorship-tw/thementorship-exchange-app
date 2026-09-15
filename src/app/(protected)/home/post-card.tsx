"use client";

import Image from "next/image";
import { CaretDown } from "@phosphor-icons/react/ssr";
import { useId } from "react";

import { Button } from "@/components/button";
import { Tag } from "@/components/tag";

import { postTypeLabels, type PostSummary } from "./posts";

export function PostCard({
  post,
  expanded,
  onToggle,
}: {
  post: PostSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const expandedContentId = useId();
  const { author, description } = post;

  return (
    <li
      className={`flex flex-col rounded-20 bg-surface p-2 ${expanded ? "gap-1" : "gap-2"}`}
    >
      <div
        className={`relative flex flex-col gap-2 rounded-16 p-4 transition-colors md:landscape:p-5 lg:p-5 ${expanded ? "bg-brand-subtle" : "bg-surface-subtle"}`}
      >
        <div className="flex h-6 items-center justify-between gap-2">
          <Tag
            variant="filled"
            tone={expanded ? "white" : "brand"}
          >
            #{postTypeLabels[post.type]}
          </Tag>

          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={expandedContentId}
            aria-label={expanded ? "收合貼文" : "展開貼文"}
            onClick={onToggle}
            className="flex size-6 cursor-pointer items-center justify-center rounded-pill bg-surface text-secondary transition focus-visible:outline-2 focus-visible:outline-brand after:absolute after:inset-0 after:rounded-16 after:content-['']"
          >
            <CaretDown
              className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-body-lg-strong text-primary">
            我能提供：{post.offersText}
          </p>
          <p className="text-body-lg-strong text-primary">
            我想找：{post.wantsText}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-2 md:landscape:px-5 lg:px-5">
        {expanded && description !== null && (
          <p className="text-body text-primary">{description}</p>
        )}

        <div className="flex items-center justify-between gap-2">
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
            <span className="text-body-strong text-gold">{author.group}</span>
          </div>

          <span className="shrink-0 text-body text-secondary">
            {post.timeLabel}
          </span>
        </div>
      </div>

      {expanded && (
        <div
          id={expandedContentId}
          className="flex justify-center py-1"
        >
          {/* TODO: 申請交換流程尚未實作。 */}
          <Button
            variant="accent"
            shape="rounded"
            className="w-full md:landscape:w-auto lg:w-auto"
          >
            申請交換
          </Button>
        </div>
      )}
    </li>
  );
}
