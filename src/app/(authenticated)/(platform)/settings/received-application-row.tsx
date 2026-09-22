"use client";

import { CaretDown } from "@phosphor-icons/react/ssr";
import { useId } from "react";

import type { ReceivedApplication } from "./settings-mock-data";

const DETAIL_FIELDS = [
  { key: "offeredResource", label: "提供" },
  { key: "wantedItem", label: "想找" },
  { key: "motivation", label: "動機" },
  { key: "contactInfo", label: "聯絡方式" },
] as const satisfies {
  key: keyof Pick<
    ReceivedApplication,
    "offeredResource" | "wantedItem" | "motivation" | "contactInfo"
  >;
  label: string;
}[];

export function ReceivedApplicationRow({
  application,
  expanded,
  onToggle,
}: {
  application: ReceivedApplication;
  expanded: boolean;
  onToggle: () => void;
}) {
  const detailsId = useId();

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body-lg-strong text-primary">
              {application.applicantName}
            </span>
            <span className="text-body text-secondary">
              {application.applicantGroup}
            </span>
          </div>
          <p className="text-body-lg text-primary">{application.requestText}</p>
        </div>

        <span className="shrink-0 text-body text-secondary">
          {application.timeLabel}
        </span>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={expanded ? "收合申請內容" : "展開申請內容"}
          onClick={onToggle}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-surface text-secondary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
        >
          <CaretDown
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div
          id={detailsId}
          className="flex flex-col gap-3 rounded-16 px-1 py-1"
        >
          {DETAIL_FIELDS.map(({ key, label }) => (
            <p
              key={key}
              className="text-body-lg text-primary"
            >
              <span className="text-body-lg-strong">{label}：</span>
              {application[key]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
