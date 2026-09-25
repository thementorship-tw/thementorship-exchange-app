import Image from "next/image";

import { Tag } from "@/components/tag";
import { PROFILE_TYPE_LABELS } from "@/shared/profile-types";

import type { SentApplication } from "./settings-items";

const DETAIL_FIELDS = [
  { key: "offeredResource", label: "我能提供" },
  { key: "wantedItem", label: "我想找" },
  { key: "motivation", label: "動機" },
  { key: "contactInfo", label: "聯絡方式" },
] as const satisfies {
  key: keyof Pick<
    SentApplication,
    "offeredResource" | "wantedItem" | "motivation" | "contactInfo"
  >;
  label: string;
}[];

export function SentApplicationRow({
  application,
}: {
  application: SentApplication;
}) {
  const isUnavailable = application.profileAvailability === "unavailable";

  return (
    <li className="flex flex-col gap-4 rounded-20 bg-glass p-6">
      {isUnavailable ? (
        <div className="flex min-h-14 items-center justify-center rounded-8 bg-surface-subtle px-4 text-body text-secondary">
          貼文已下架
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-16 bg-surface-subtle p-4 md:landscape:p-5 lg:p-5">
          <Tag
            variant="filled"
            className="self-start"
          >
            #{PROFILE_TYPE_LABELS[application.profileType]}
          </Tag>
          <p className="text-body-lg text-primary">
            我能提供：{application.profileOffersText}
          </p>
          <p className="text-body-lg text-primary">
            我想找：{application.profileWantsText}
          </p>
          {application.profileDescription !== null && (
            <p className="whitespace-pre-wrap text-body-lg text-primary">
              {application.profileDescription}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            {application.recipientAvatarUrl === null ? (
              <span className="size-6 shrink-0 rounded-pill bg-blue-9" />
            ) : (
              <Image
                src={application.recipientAvatarUrl}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-pill object-cover"
              />
            )}
            <span className="text-body text-primary">
              {application.recipientName}
            </span>
            <span className="text-body-strong text-gold">
              {application.recipientGroup}
            </span>
          </div>
        </div>
      )}

      <dl className="flex flex-col">
        {DETAIL_FIELDS.map(({ key, label }, index) => (
          <div
            key={key}
            className={`${index > 0 ? "pt-3" : ""} ${
              index < DETAIL_FIELDS.length - 1
                ? "border-b border-line pb-3"
                : ""
            }`}
          >
            <dt className="text-body-lg text-primary">{label}：</dt>
            <dd className="mt-1 whitespace-pre-wrap text-body-lg text-primary">
              {application[key]}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-right text-body text-secondary">
        {application.timeLabel}送出
      </p>
    </li>
  );
}
