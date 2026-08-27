"use client";

import { Dialog } from "@/components/dialog";

export function LoginErrorDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      title="登入遇到問題了嗎？"
      onClose={onClose}
      showCloseButton
    >
      <p>
        請先確認你使用報名曼陀號時的帳號登入，如仍無法登入，請點此回報專案小組，我們將儘快與你聯絡。
      </p>
    </Dialog>
  );
}
