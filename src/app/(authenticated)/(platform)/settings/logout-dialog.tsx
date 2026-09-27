"use client";

import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";

export function LogoutDialog({
  open,
  confirming = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  confirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      title="確定要登出嗎？"
      onClose={onClose}
      placement="homeContent"
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            disabled={confirming}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            size="sm"
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? "登出中…" : "確定登出"}
          </Button>
        </>
      }
    >
      <p>登出後需要重新以 Google 帳號登入。</p>
    </Dialog>
  );
}
