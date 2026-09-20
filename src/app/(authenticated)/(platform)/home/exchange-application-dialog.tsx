"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Toast } from "@/components/toast";
import {
  CONTACT_LOG_CONTACT_INFO_MAX_LENGTH,
  CONTACT_LOG_MOTIVATION_MAX_LENGTH,
  CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH,
  CONTACT_LOG_WANTED_ITEM_MAX_LENGTH,
} from "@/shared/api/contact-logs/constants";

type FormValues = {
  offeredResource: string;
  wantedItem: string;
  motivation: string;
  contactInfo: string;
};

type FormField = {
  key: keyof FormValues;
  label: string;
  placeholder: string;
  maxLength: number;
};

const EMPTY_FORM: FormValues = {
  offeredResource: "",
  wantedItem: "",
  motivation: "",
  contactInfo: "",
};

const FIELDS: FormField[] = [
  {
    key: "offeredResource",
    label: "我能提供：",
    placeholder: "你能提供的是？",
    maxLength: CONTACT_LOG_OFFERED_RESOURCE_MAX_LENGTH,
  },
  {
    key: "wantedItem",
    label: "我想找：",
    placeholder: "你想交換的是？",
    maxLength: CONTACT_LOG_WANTED_ITEM_MAX_LENGTH,
  },
  {
    key: "motivation",
    label: "動機：",
    placeholder: "為什麼想申請交換？",
    maxLength: CONTACT_LOG_MOTIVATION_MAX_LENGTH,
  },
  {
    key: "contactInfo",
    label: "聯絡方式：",
    placeholder: "對方該如何與你聯絡？",
    maxLength: CONTACT_LOG_CONTACT_INFO_MAX_LENGTH,
  },
];

type ApiErrorBody = { error?: { code?: string } };

function AutoGrowTextarea({
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={1}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 min-h-6 resize-none overflow-hidden bg-transparent text-body text-primary outline-none placeholder:text-secondary"
    />
  );
}

export function ExchangeApplicationDialog({
  profileId,
  open,
  onClose,
  onSent,
}: {
  profileId: string;
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [phase, setPhase] = useState<"form" | "confirm">("form");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | undefined
  >();

  const close = () => {
    if (submitting) return;
    setPhase("form");
    onClose();
  };

  const validateAndConfirm = () => {
    if (FIELDS.some(({ key }) => values[key].trim().length === 0)) {
      setToast({
        message: "請完整填入資訊，並確保字數未超過上限",
        variant: "error",
      });
      return;
    }
    setPhase("confirm");
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          ...Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value.trim()]),
          ),
        }),
      });

      if (response.ok) {
        setValues(EMPTY_FORM);
        setPhase("form");
        setToast({ message: "你的申請已送出", variant: "success" });
        onClose();
        onSent();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
      if (body.error?.code === "DUPLICATE_CONTACT_TODAY") {
        setToast({
          message: "你今日已申請交換過該貼文，不可重複申請",
          variant: "error",
        });
        setPhase("form");
        onClose();
        return;
      }

      if (body.error?.code === "SELF_CONTACT_NOT_ALLOWED") {
        setToast({ message: "不可申請自己的交換貼文", variant: "error" });
      } else if (body.error?.code === "VALIDATION_ERROR") {
        setToast({
          message: "請完整填入資訊，並確保字數未超過上限",
          variant: "error",
        });
      } else {
        setToast({ message: "申請送出失敗，請稍後再試", variant: "error" });
      }
      setPhase("form");
    } catch {
      setToast({ message: "申請送出失敗，請稍後再試", variant: "error" });
      setPhase("form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        title={phase === "form" ? "申請交換" : "確認送出申請嗎？"}
        onClose={close}
        size={phase === "form" ? "lg" : "md"}
        placement="homeContent"
        scrollable={phase === "form"}
        actions={
          phase === "form" ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={close}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={validateAndConfirm}
              >
                送出申請
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={submitting}
                onClick={() => setPhase("form")}
              >
                取消
              </Button>
              <Button
                size="sm"
                disabled={submitting}
                onClick={() => void submit()}
              >
                {submitting ? "送出中…" : "確認送出"}
              </Button>
            </>
          )
        }
      >
        {phase === "form" ? (
          <div className="flex flex-col">
            <p className="mb-3">
              送出申請後對方將收到以下資訊，如對方有意願與你交換技能，他將主動與你聯繫：
            </p>
            {FIELDS.map(({ key, label, placeholder, maxLength }) => (
              <label
                key={key}
                className="border-line flex flex-col border-b py-2 first:pt-0"
              >
                <span className="flex items-center justify-between gap-3 text-primary">
                  <span className="text-body-lg-strong">{label}</span>
                  <span className="text-body text-secondary">
                    ({values[key].length}/{maxLength})
                  </span>
                </span>
                <AutoGrowTextarea
                  value={values[key]}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        ) : (
          <p>確認送出後，將不可修改你填寫的申請內容。確定要送出嗎？</p>
        )}
      </Dialog>

      <Toast
        open={toast !== undefined}
        variant={toast?.variant}
        placement={toast?.variant === "error" ? "homeContent" : "viewport"}
        onClose={() => setToast(undefined)}
      >
        {toast?.message}
      </Toast>
    </>
  );
}
