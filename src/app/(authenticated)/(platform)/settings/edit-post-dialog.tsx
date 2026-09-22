"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Toast } from "@/components/toast";
import { PROFILE_TYPES } from "@/shared/profile-types";

import { ExchangePostFormFields } from "../home/exchange-post-form-fields";
import {
  type ExchangePostFormValues,
  validateExchangePostFormValues,
} from "../home/exchange-post-form";

import type { MyPost } from "./settings-mock-data";

export function EditPostDialog({
  post,
  open,
  onClose,
  onSave,
}: {
  post: MyPost;
  open: boolean;
  onClose: () => void;
  onSave: (values: ExchangePostFormValues) => void;
}) {
  const [offersText, setOffersText] = useState(post.offersText);
  const [wantsText, setWantsText] = useState(post.wantsText);
  const [description, setDescription] = useState(post.description);
  const [showErrors, setShowErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

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
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
            >
              確認修改
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
            selectableTypes={[]}
            displayTypes={[...PROFILE_TYPES]}
            selectedType={post.type}
            onSelectType={() => {}}
            typeSelectionDisabled
            tagHint="點擊選擇，一種類標籤僅能發佈一篇貼文"
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
