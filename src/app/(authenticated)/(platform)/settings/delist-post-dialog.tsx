"use client";

import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";

export function DelistPostDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      title="確定要下架此貼文？"
      onClose={onClose}
      placement="homeContent"
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
            onClick={onConfirm}
          >
            確定下架
          </Button>
        </>
      }
    >
      <p>貼文下架後無法復原，你確定要下架此貼文嗎？</p>
    </Dialog>
  );
}
