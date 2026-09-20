"use client";

import Image from "next/image";
import { CaretDown } from "@phosphor-icons/react/ssr";
import { useId, useState } from "react";

import { Button } from "@/components/button";
import { Tag } from "@/components/tag";
import { Toast } from "@/components/toast";
import { PROFILE_TYPE_LABELS } from "@/shared/profile-types";

import type { CardSummary } from "./card-summary";
import { ExchangeApplicationDialog } from "./exchange-application-dialog";

export function ExchangeCard({
  card,
  expanded,
  onToggle,
  appliedWithinCooldown,
  onApplicationSent,
}: {
  card: CardSummary;
  expanded: boolean;
  onToggle: () => void;
  appliedWithinCooldown: boolean;
  onApplicationSent: () => void;
}) {
  const expandedContentId = useId();
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [duplicateToastOpen, setDuplicateToastOpen] = useState(false);
  const { type, offersText, wantsText, timeLabel, author, description } = card;

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
            #{PROFILE_TYPE_LABELS[type]}
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
            我能提供：{offersText}
          </p>
          <p className="text-body-lg-strong text-primary">
            我想找：{wantsText}
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

          <span className="shrink-0 text-body text-secondary">{timeLabel}</span>
        </div>
      </div>

      {expanded && (
        <div
          id={expandedContentId}
          className="flex justify-center py-1"
        >
          {appliedWithinCooldown ? (
            <button
              type="button"
              onClick={() => setDuplicateToastOpen(true)}
              className="cursor-pointer rounded-8 px-4 py-3 text-body-lg-strong text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              已申請過
            </button>
          ) : (
            <Button
              variant="accent"
              shape="rounded"
              onClick={() => setApplicationDialogOpen(true)}
              className="w-full md:landscape:w-auto lg:w-auto"
            >
              申請交換
            </Button>
          )}
        </div>
      )}

      <ExchangeApplicationDialog
        profileId={card.id}
        open={applicationDialogOpen}
        onClose={() => setApplicationDialogOpen(false)}
        onSent={onApplicationSent}
      />

      <Toast
        open={duplicateToastOpen}
        variant="error"
        placement="homeContent"
        onClose={() => setDuplicateToastOpen(false)}
      >
        你今日已申請交換過該貼文，不可重複申請
      </Toast>
    </li>
  );
}
