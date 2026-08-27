"use client";

import { Dialog } from "@/components/dialog";

import { loginErrorContent } from "./login-errors";

/**
 * 純呈現：文案由 `login-errors.ts` 依代碼決定，這裡不判斷任何情境。
 * 要新增或修改文案請改那個檔案。
 */
export function LoginErrorDialog({
  open,
  errorCode,
  onClose,
}: {
  open: boolean;
  /** 登入頁網址上的 `?error=` */
  errorCode: string | null;
  onClose: () => void;
}) {
  const { title, body } = loginErrorContent(errorCode);

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      showCloseButton
    >
      <p className="text-left">{body}</p>
    </Dialog>
  );
}
