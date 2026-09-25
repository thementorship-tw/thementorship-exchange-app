"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Tag } from "@/components/tag";
import { PROFILE_TYPE_LABELS } from "@/shared/profile-types";

import { useNotifications } from "../_providers/notification-provider";
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
  onEdit,
  onDelist,
  targetApplicationId,
}: {
  post: MyPost;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelist: () => void;
  /** 從通知點過來的目標申請；非 undefined 代表這篇貼文是導航目標，掛載時要捲過去。 */
  targetApplicationId?: string;
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
  >(targetApplicationId ?? null);
  const rowRef = useRef<HTMLLIElement>(null);
  const targetApplicationRowRef = useRef<HTMLDivElement>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const { markAsRead } = useNotifications();
  // 記錄這個 session 內已經觸發過已讀的 id，避免同一筆申請反覆展開/收合
  // 時重複打 PATCH（application.readAt 本身不會因此在本地更新）。
  const markedReadIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (targetApplicationId === undefined) return;
    // 優先捲到目標那筆申請本身；如果它不在已載入的第一頁裡（見已知邊界情況），
    // 退回捲到整篇貼文，至少讓使用者看到正確的貼文。
    const target = targetApplicationRowRef.current ?? rowRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    // 捲動本身是非同步的漸進動畫，跟高亮同時開始的話，畫面捲到定位時高亮
    // 常常已經淡出大半，使用者幾乎看不到；延後一點再觸發高亮比較可靠。
    const timer = setTimeout(() => setShowHighlight(true), 500);
    return () => clearTimeout(timer);
  }, [targetApplicationId]);

  // 當使用者從系統通知進入設定中心，指定申請自動展開時，也要把該申請標記為已讀，而且避免重複送出已讀請求。
  useEffect(() => {
    if (targetApplicationId === undefined) return;

    const targetApplication = applications.find(
      (application) => application.id === targetApplicationId,
    );
    if (
      targetApplication === undefined ||
      targetApplication.readAt !== null ||
      markedReadIdsRef.current.has(targetApplicationId)
    ) {
      return;
    }

    markedReadIdsRef.current.add(targetApplicationId);
    void markAsRead(targetApplicationId).then((succeeded) => {
      if (!succeeded) {
        markedReadIdsRef.current.delete(targetApplicationId);
      }
    });
  }, [applications, markAsRead, targetApplicationId]);

  return (
    <li
      ref={rowRef}
      className="flex flex-col gap-1 rounded-20 bg-glass p-6"
    >
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
              onEdit={onEdit}
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
              <div
                ref={
                  application.id === targetApplicationId
                    ? targetApplicationRowRef
                    : undefined
                }
                className={
                  application.id === targetApplicationId && showHighlight
                    ? "rounded-4 animate-[target-highlight_2s_ease-out]"
                    : undefined
                }
              >
                <ReceivedApplicationRow
                  application={application}
                  expanded={expandedApplicationId === application.id}
                  onToggle={() => {
                    const willExpand = expandedApplicationId !== application.id;
                    setExpandedApplicationId((current) =>
                      current === application.id ? null : application.id,
                    );
                    if (
                      willExpand &&
                      application.readAt === null &&
                      !markedReadIdsRef.current.has(application.id)
                    ) {
                      markedReadIdsRef.current.add(application.id);
                      void markAsRead(application.id).then((succeeded) => {
                        if (!succeeded) {
                          markedReadIdsRef.current.delete(application.id);
                        }
                      });
                    }
                  }}
                />
              </div>
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
