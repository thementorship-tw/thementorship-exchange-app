"use client";

import { useEffect, useRef } from "react";

import { Tag } from "@/components/tag";
import {
  EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH,
  EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH,
  EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH,
} from "@/shared/api/exchange-info/schemas";
import { PROFILE_TYPE_LABELS, type ProfileType } from "@/shared/profile-types";

import type { ExchangePostFormValues } from "./exchange-post-form";

export type ExchangePostFormFieldsProps = {
  values: ExchangePostFormValues;
  onOffersTextChange: (value: string) => void;
  onWantsTextChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  selectableTypes: ProfileType[];
  selectedType: ProfileType | null;
  onSelectType: (type: ProfileType) => void;
  tagHint: string;
  tagsDisabled?: boolean;
  fieldsDisabled?: boolean;
  showErrors?: boolean;
  offersInvalid: boolean;
  wantsInvalid: boolean;
  descriptionInvalid: boolean;
  showTypeError?: boolean;
  /** 父層 Dialog 開關時傳入，以便重新計算 textarea 高度。 */
  autoGrowKey?: boolean;
  descriptionClassName?: string;
};

export function ExchangePostFormFields({
  values,
  onOffersTextChange,
  onWantsTextChange,
  onDescriptionChange,
  selectableTypes,
  selectedType,
  onSelectType,
  tagHint,
  tagsDisabled = false,
  fieldsDisabled = false,
  showErrors = false,
  offersInvalid,
  wantsInvalid,
  descriptionInvalid,
  showTypeError = false,
  autoGrowKey = true,
  descriptionClassName = "relative min-h-36 flex-1 md:landscape:min-h-28 lg:min-h-28",
}: ExchangePostFormFieldsProps) {
  const offersTextareaRef = useRef<HTMLTextAreaElement>(null);
  const wantsTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    for (const textarea of [
      offersTextareaRef.current,
      wantsTextareaRef.current,
    ]) {
      if (!textarea) continue;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [values.offersText, values.wantsText, autoGrowKey]);

  return (
    <>
      <div className="rounded-16 bg-surface-subtle p-3 md:landscape:p-4 lg:p-4">
        <fieldset disabled={tagsDisabled || fieldsDisabled}>
          <legend className="sr-only">選擇貼文標籤</legend>
          <div className="flex flex-wrap items-center gap-2">
            {selectableTypes.map((profileType) => (
              <button
                key={profileType}
                type="button"
                aria-pressed={selectedType === profileType}
                onClick={() => onSelectType(profileType)}
                className="cursor-pointer rounded-pill focus-visible:outline-2 focus-visible:outline-brand"
              >
                <Tag
                  variant="filled"
                  tone={selectedType === profileType ? "brand" : "white"}
                >
                  #{PROFILE_TYPE_LABELS[profileType]}
                </Tag>
              </button>
            ))}
            <span className="text-caption text-secondary">{tagHint}</span>
          </div>
        </fieldset>

        <label className="mt-3 grid grid-cols-[auto_1fr_auto] items-start gap-x-1 text-body">
          <span className="text-body-strong">我能提供：</span>
          <textarea
            ref={offersTextareaRef}
            rows={1}
            value={values.offersText}
            onChange={(event) => onOffersTextChange(event.target.value)}
            maxLength={EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH}
            disabled={fieldsDisabled}
            aria-invalid={showErrors && offersInvalid}
            placeholder="你能提供的是？"
            className="max-h-24 min-w-0 resize-none overflow-y-auto bg-transparent text-primary outline-none placeholder:text-secondary"
          />
          <span
            className={
              offersInvalid && values.offersText.length > 0
                ? "text-error"
                : "text-secondary"
            }
          >
            ({values.offersText.length}/{EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH})
          </span>
        </label>

        <label className="mt-2 grid grid-cols-[auto_1fr_auto] items-start gap-x-1 text-body">
          <span className="text-body-strong">我想找：</span>
          <textarea
            ref={wantsTextareaRef}
            rows={1}
            value={values.wantsText}
            onChange={(event) => onWantsTextChange(event.target.value)}
            maxLength={EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH}
            disabled={fieldsDisabled}
            aria-invalid={showErrors && wantsInvalid}
            placeholder="你想尋找交換的是？"
            className="max-h-24 min-w-0 resize-none overflow-y-auto bg-transparent text-primary outline-none placeholder:text-secondary"
          />
          <span
            className={
              wantsInvalid && values.wantsText.length > 0
                ? "text-error"
                : "text-secondary"
            }
          >
            ({values.wantsText.length}/{EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH})
          </span>
        </label>
      </div>

      <label className={descriptionClassName}>
        <span className="sr-only">貼文詳細描述</span>
        <textarea
          value={values.description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH}
          disabled={fieldsDisabled}
          aria-invalid={descriptionInvalid}
          placeholder="輸入想要徵求／交換／尋找的內容描述，至多 300 字……"
          className="size-full resize-none bg-transparent pb-7 text-body text-primary outline-none placeholder:text-secondary"
        />
        <span
          className={`absolute right-0 bottom-0 text-body ${descriptionInvalid ? "text-error" : "text-secondary"}`}
        >
          ({values.description.length}/{EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH})
        </span>
      </label>

      {showTypeError && (
        <p
          role="alert"
          className="text-caption text-error"
        >
          請選擇貼文標籤。
        </p>
      )}
    </>
  );
}
