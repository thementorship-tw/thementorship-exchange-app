"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Toast } from "@/components/toast";
import type { ExchangeInfoAvailabilityResponse } from "@/shared/api/exchange-info/schemas";
import type { PatchMyProfileContentInput } from "@/shared/api/me-profiles/schemas";
import { PROFILE_TYPES, type ProfileType } from "@/shared/profile-types";

import { ExchangePostFormFields } from "../home/exchange-post-form-fields";
import { validateExchangePostFormValues } from "../home/exchange-post-form";

import type { MyPost } from "./settings-items";

export function EditPostDialog({
  post,
  open,
  onClose,
  saving = false,
  onSave,
}: {
  post: MyPost;
  open: boolean;
  onClose: () => void;
  saving?: boolean;
  onSave: (values: PatchMyProfileContentInput) => void;
}) {
  const [type, setType] = useState<ProfileType>(post.type);
  const [offersText, setOffersText] = useState(post.offersText);
  const [wantsText, setWantsText] = useState(post.wantsText);
  const [description, setDescription] = useState(post.description);
  const [showErrors, setShowErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectableTypes, setSelectableTypes] = useState<ProfileType[]>([
    post.type,
  ]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    void fetch("/api/exchange-info/availability")
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Availability failed: ${response.status}`);
        return (await response.json()) as ExchangeInfoAvailabilityResponse;
      })
      .then(({ data }) => {
        if (cancelled) return;
        setSelectableTypes(
          PROFILE_TYPES.filter(
            (candidate) =>
              candidate === post.type ||
              data.availableTypes.includes(candidate),
          ),
        );
      })
      .catch((error: unknown) => {
        console.error("Failed to load available profile types", error);
        if (!cancelled) setErrorMessage("載入可用標籤失敗，請稍後再試");
      })
      .finally(() => {
        if (!cancelled) setLoadingTypes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, post.type]);

  const formValues = { offersText, wantsText, description };
  const { offersInvalid, wantsInvalid, descriptionInvalid } =
    validateExchangePostFormValues(formValues);

  function handleConfirm() {
    setShowErrors(true);
    if (offersInvalid || wantsInvalid || descriptionInvalid) {
      setErrorMessage("請完整填入資訊，並確保字數未超過上限");
      return;
    }

    onSave({
      type,
      offersText: offersText.trim(),
      wantsText: wantsText.trim(),
      description: description.trim(),
    });
  }

  return (
    <>
      <Dialog
        open={open}
        title="修改貼文"
        placement="homeContent"
        scrollable
        onClose={onClose}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              size="sm"
              disabled={saving}
              onClick={handleConfirm}
            >
              {saving ? "儲存中…" : "確認修改"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 text-primary">
          <ExchangePostFormFields
            values={formValues}
            onOffersTextChange={setOffersText}
            onWantsTextChange={setWantsText}
            onDescriptionChange={setDescription}
            selectableTypes={selectableTypes}
            selectedType={type}
            onSelectType={setType}
            tagsDisabled={loadingTypes}
            tagHint={
              loadingTypes
                ? "載入可用標籤中…"
                : "點擊選擇，一種類標籤僅能發佈一篇貼文"
            }
            showErrors={showErrors}
            offersInvalid={offersInvalid}
            wantsInvalid={wantsInvalid}
            descriptionInvalid={descriptionInvalid}
            autoGrowKey={open}
            descriptionClassName="relative min-h-28"
          />
        </div>
      </Dialog>

      <Toast
        open={errorMessage !== undefined}
        variant="error"
        placement="homeContent"
        onClose={() => setErrorMessage(undefined)}
      >
        {errorMessage}
      </Toast>
    </>
  );
}
