"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Toast } from "@/components/toast";
import { withBasePath } from "@/shared/base-path";
import type { ExchangeInfoAvailabilityResponse } from "@/shared/api/exchange-info/schemas";
import type { ProfileType } from "@/shared/profile-types";

import { usePublishExchange } from "../_providers/publish-exchange-provider";
import { ExchangePostFormFields } from "./exchange-post-form-fields";
import { validateExchangePostFormValues } from "./exchange-post-form";

type ToastState = { variant: "success" | "error"; message: string } | null;

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

const DESKTOP_PUBLISHER_MEDIA =
  "(min-width: 1024px), (min-width: 768px) and (orientation: landscape)";
const MOBILE_DIALOG_TOP = 24;

async function readApiError(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

export function PublishExchangeDialogContainer() {
  const { publisherOpen, closePublisher, notifyCreated } = usePublishExchange();

  return (
    <PublishExchangeDialog
      open={publisherOpen}
      onClose={closePublisher}
      onCreated={notifyCreated}
    />
  );
}

export function PublishExchangeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<ProfileType[]>([]);
  const [type, setType] = useState<ProfileType | null>(null);
  const [offersText, setOffersText] = useState("");
  const [wantsText, setWantsText] = useState("");
  const [description, setDescription] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [dialogStyle, setDialogStyle] = useState<CSSProperties>();
  const [viewportDebug, setViewportDebug] = useState("");
  const dialogViewportHeightRef = useRef<number | null>(null);
  const pointerActiveRef = useRef(false);
  const pendingViewportExpansionRef = useRef(false);

  const formValues = { offersText, wantsText, description };
  const { offersInvalid, wantsInvalid, descriptionInvalid } =
    validateExchangePostFormValues(formValues);
  const formInvalid =
    type === null || offersInvalid || wantsInvalid || descriptionInvalid;

  const tagHint = loadingTypes
    ? "載入可用標籤中…"
    : availableTypes.length === 0
      ? "目前沒有可發佈的標籤"
      : "點擊選擇，一種類標籤僅能發佈一篇貼文";

  const measureDialogBounds = () => {
    if (!window.matchMedia(DESKTOP_PUBLISHER_MEDIA).matches) {
      const viewport = window.visualViewport;
      if (!viewport) {
        setDialogStyle(undefined);
        return;
      }

      const updateDialogStyle = () => {
        dialogViewportHeightRef.current = viewport.height;
        const height = Math.max(viewport.height - MOBILE_DIALOG_TOP, 0);
        setDialogStyle({
          top: viewport.offsetTop + MOBILE_DIALOG_TOP,
          left: viewport.offsetLeft,
          width: viewport.width,
          height,
          margin: 0,
        });
        setViewportDebug(
          `vv h=${Math.round(viewport.height)} top=${Math.round(viewport.offsetTop)} winH=${window.innerHeight} dlgH=${Math.round(height)}`,
        );
      };

      const isExpanding =
        dialogViewportHeightRef.current !== null &&
        viewport.height > dialogViewportHeightRef.current;

      // 鍵盤收起會讓視口變高：若此時仍有觸控手勢在進行中，先記錄待處理的更新，
      // 等手勢結束（pointerup/pointercancel）再套用，避免按鈕在點擊瞬間被版面重排推走。
      if (isExpanding && pointerActiveRef.current) {
        pendingViewportExpansionRef.current = true;
        return;
      }

      pendingViewportExpansionRef.current = false;
      updateDialogStyle();
      return;
    }

    dialogViewportHeightRef.current = null;
    pendingViewportExpansionRef.current = false;

    const content = document.querySelector<HTMLElement>(
      "[data-publish-exchange-content]",
    );
    if (!content) return;

    const { top, left, width } = content.getBoundingClientRect();
    setDialogStyle({ top, left, width });
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const viewport = window.visualViewport;
    const handlePointerDown = () => {
      pointerActiveRef.current = true;
    };
    const flushPendingExpansion = () => {
      pointerActiveRef.current = false;
      if (pendingViewportExpansionRef.current) {
        pendingViewportExpansionRef.current = false;
        measureDialogBounds();
      }
    };

    window.addEventListener("resize", measureDialogBounds);
    viewport?.addEventListener("resize", measureDialogBounds);
    viewport?.addEventListener("scroll", measureDialogBounds);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", flushPendingExpansion);
    window.addEventListener("pointercancel", flushPendingExpansion);

    return () => {
      window.removeEventListener("resize", measureDialogBounds);
      viewport?.removeEventListener("resize", measureDialogBounds);
      viewport?.removeEventListener("scroll", measureDialogBounds);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", flushPendingExpansion);
      window.removeEventListener("pointercancel", flushPendingExpansion);
      pointerActiveRef.current = false;
      pendingViewportExpansionRef.current = false;
      dialogViewportHeightRef.current = null;
    };
  }, [open]);

  const resetForm = () => {
    setAvailableTypes([]);
    setLoadingTypes(false);
    setType(null);
    setOffersText("");
    setWantsText("");
    setDescription("");
    setShowErrors(false);
    setConfirming(false);
  };

  const loadAvailability = async () => {
    setLoadingTypes(true);
    try {
      const response = await fetch(
        withBasePath("/api/exchange-info/availability"),
      );
      if (!response.ok)
        throw new Error(`Availability failed: ${response.status}`);
      const body = (await response.json()) as ExchangeInfoAvailabilityResponse;
      setAvailableTypes(body.data.availableTypes);
      setType((current) =>
        current && body.data.availableTypes.includes(current)
          ? current
          : body.data.availableTypes.length === 1
            ? body.data.availableTypes[0]
            : null,
      );
      return body.data.availableTypes;
    } catch (error) {
      console.error(error);
      setToast({ variant: "error", message: "載入可用標籤失敗，請稍後再試" });
      return null;
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      measureDialogBounds();
      void loadAvailability();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const closePublisher = () => {
    if (submitting) return;
    onClose();
    resetForm();
  };

  const requestConfirmation = () => {
    setShowErrors(true);
    if (formInvalid) {
      setToast({
        variant: "error",
        message: "請完整填入資訊，並確保字數未超過上限",
      });
      return;
    }
    setConfirming(true);
  };

  const publish = async () => {
    if (type === null || formInvalid) return;

    setSubmitting(true);
    try {
      const response = await fetch(withBasePath("/api/exchange-info"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, offersText, wantsText, description }),
      });

      if (!response.ok) {
        const body = await readApiError(response);
        if (
          response.status === 409 ||
          body.error?.code === "DUPLICATE_PROFILE_TYPE"
        ) {
          setConfirming(false);
          await loadAvailability();
          setToast({
            variant: "error",
            message:
              "你已有該種類標籤貼文，不可再重複發文；請更換種類標籤，或去設定中心下架舊貼文",
          });
          return;
        }
        throw new Error(
          body.error?.message ?? `Publish failed: ${response.status}`,
        );
      }

      setConfirming(false);
      onClose();
      resetForm();
      onCreated();
      setToast({ variant: "success", message: "你的貼文已成功發佈" });
    } catch (error) {
      console.error(error);
      setConfirming(false);
      setToast({ variant: "error", message: "發佈失敗，請稍後再試" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        style={dialogStyle}
        aria-labelledby="publish-exchange-title"
        onCancel={(event) => {
          event.preventDefault();
          closePublisher();
        }}
        className="mt-6 h-[calc(100dvh-1.5rem)] max-h-none w-full max-w-none rounded-t-20 bg-surface p-0 text-primary outline-none backdrop:bg-overlay md:landscape:!m-0 md:landscape:!h-fit md:landscape:!max-w-none md:landscape:bg-transparent lg:!m-0 lg:!h-fit lg:!max-w-none lg:bg-transparent"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            requestConfirmation();
          }}
          className="flex h-full min-h-0 flex-col gap-4 p-4 md:landscape:h-auto md:landscape:p-0 lg:h-auto lg:p-0"
        >
          <h2
            id="publish-exchange-title"
            className="shrink-0 text-center text-body-lg-strong md:landscape:sr-only lg:sr-only"
          >
            發布貼文
          </h2>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain rounded-20 bg-surface p-2">
            <ExchangePostFormFields
              values={formValues}
              onOffersTextChange={setOffersText}
              onWantsTextChange={setWantsText}
              onDescriptionChange={setDescription}
              selectableTypes={availableTypes}
              selectedType={type}
              onSelectType={setType}
              tagHint={tagHint}
              tagsDisabled={loadingTypes}
              fieldsDisabled={submitting}
              showErrors={showErrors}
              offersInvalid={offersInvalid}
              wantsInvalid={wantsInvalid}
              descriptionInvalid={descriptionInvalid}
              showTypeError={
                showErrors && type === null && availableTypes.length > 0
              }
              dialogOpen={open}
              descriptionClassName="relative mx-3 mb-3 min-h-36 flex-1 md:landscape:min-h-28 lg:min-h-28"
            />
          </div>

          <div className="flex shrink-0 justify-end gap-2">
            <Button
              type="button"
              variant="accent"
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={closePublisher}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              disabled={
                loadingTypes || submitting || availableTypes.length === 0
              }
            >
              確認發文
            </Button>
          </div>

          <p className="shrink-0 text-center text-xs text-secondary">
            deploy-check: 2026-09-27 21:45 CST · {viewportDebug || "vv: n/a"}
          </p>
        </form>
      </dialog>

      <Dialog
        open={confirming}
        title="確認要發文嗎？"
        placement="homeContent"
        onClose={() => !submitting && setConfirming(false)}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={() => void publish()}
              disabled={submitting}
            >
              {submitting ? "發佈中…" : "確認發文"}
            </Button>
          </>
        }
      >
        一個種類標籤僅能發佈一篇貼文，發布後可至「我的頁面」修改與下架此貼文。
      </Dialog>

      <Toast
        open={toast !== null}
        variant={toast?.variant}
        placement="homeContent"
        onClose={() => setToast(null)}
      >
        {toast?.message}
      </Toast>
    </>
  );
}
