"use client";

import { Fragment, useState } from "react";

import { Button } from "@/components/button";
import { Tag } from "@/components/tag";
import { PROFILE_TYPE_LABELS } from "@/shared/profile-types";

import {
  toReceivedApplicationFromResponse,
  type MyPost,
} from "./settings-items";
import { PostActionMenu } from "./post-action-menu";
import { ReceivedApplicationRow } from "./received-application-row";
import { useContactLogPagination } from "./use-contact-log-pagination";

export function MyPostRow({
  post,
  menuOpen,
  onMenuOpenChange,
  onDelist,
}: {
  post: MyPost;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onDelist: () => void;
}) {
  const isDelisted = post.status === "delisted";
  const {
    items: applications,
    status: loadStatus,
    hasMore: hasMoreApplications,
    loadMore: loadMoreApplications,
  } = useContactLogPagination({
    role: "received",
    profileId: post.id,
    initialItems: post.receivedApplications,
    initialTotalPages: post.receivedApplicationTotalPages,
    mapItem: toReceivedApplicationFromResponse,
  });
  const hasApplications = !isDelisted && applications.length > 0;
  const [expandedApplicationId, setExpandedApplicationId] = useState<
    string | null
  >(null);

  return (
    <li className="flex flex-col gap-1 rounded-20 bg-glass p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Tag
            variant="filled"
            tone={isDelisted ? "white" : "brand"}
          >
            #{PROFILE_TYPE_LABELS[post.type]}
          </Tag>
          {isDelisted ? (
            <span className="text-body text-secondary">已下架</span>
          ) : (
            <PostActionMenu
              open={menuOpen}
              onOpenChange={onMenuOpenChange}
              onDelist={onDelist}
            />
          )}
        </div>

        <p className="text-body-lg text-primary">我能提供：{post.offersText}</p>
        <p className="text-body-lg text-primary">我想找：{post.wantsText}</p>
        <p className="whitespace-pre-wrap text-body-lg text-primary">
          {post.description}
        </p>

        {hasApplications && (
          <p className="text-body text-secondary">{post.timeLabel}</p>
        )}
      </div>

      {hasApplications && (
        <div
          aria-label="收到申請"
          className="mt-2 flex flex-col gap-1 overflow-hidden rounded-8 bg-surface-subtle py-1"
        >
          {applications.map((application, index) => (
            <Fragment key={application.id}>
              {index > 0 && <div className="mx-4 h-px bg-line" />}
              <ReceivedApplicationRow
                application={application}
                expanded={expandedApplicationId === application.id}
                onToggle={() =>
                  setExpandedApplicationId((current) =>
                    current === application.id ? null : application.id,
                  )
                }
              />
            </Fragment>
          ))}
          {hasMoreApplications && (
            <div className="flex justify-center px-4 py-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={loadStatus === "loading"}
                onClick={() => loadMoreApplications(true)}
              >
                {loadStatus === "error" ? "重新載入" : "載入更多申請"}
              </Button>
            </div>
          )}
        </div>
      )}

      {!hasApplications && (
        <p className="text-right text-body text-secondary">{post.timeLabel}</p>
      )}
    </li>
  );
}
