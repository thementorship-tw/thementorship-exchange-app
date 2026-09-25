"use client";

import { CircleNotch } from "@phosphor-icons/react/ssr";
import { useEffect, useRef } from "react";

import { Button } from "@/components/button";

import {
  toSentApplicationFromResponse,
  type SentApplication,
} from "./settings-items";
import { SentApplicationRow } from "./sent-application-row";
import { useContactLogPagination } from "./use-contact-log-pagination";

export function SentApplicationList({
  active,
  initialApplications,
  initialTotalPages,
}: {
  active: boolean;
  initialApplications: SentApplication[];
  initialTotalPages: number;
}) {
  const {
    items: applications,
    status,
    hasMore,
    loadMore,
  } = useContactLogPagination({
    role: "sent",
    initialItems: initialApplications,
    initialTotalPages,
    mapItem: toSentApplicationFromResponse,
  });
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!active) return;
    const list = listRef.current;
    if (!list) return;

    const loadIfNearBottom = () => {
      if (list.scrollHeight - list.scrollTop - list.clientHeight <= 200) {
        loadMore();
      }
    };

    const frame = requestAnimationFrame(loadIfNearBottom);
    list.addEventListener("scroll", loadIfNearBottom, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("scroll", loadIfNearBottom);
    };
  }, [active, loadMore]);

  if (applications.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-20 bg-glass px-6 py-12 text-body text-secondary">
        尚無送出的申請
      </div>
    );
  }

  return (
    <ul
      ref={listRef}
      aria-busy={status === "loading"}
      className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
    >
      {applications.map((application) => (
        <SentApplicationRow
          key={application.id}
          application={application}
        />
      ))}
      {hasMore && (
        <li className="flex list-none justify-center py-6">
          {status === "error" ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadMore(true)}
            >
              重新載入
            </Button>
          ) : (
            <CircleNotch
              aria-label="載入中"
              className="size-6 animate-spin text-secondary"
            />
          )}
        </li>
      )}
    </ul>
  );
}
