"use client";

import { Dialog } from "@/components/dialog";

import { loginErrorContent } from "./login-errors";

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
      <p className="text-left">
        {body.map((part, index) =>
          typeof part === "string" ? (
            part
          ) : (
            <a
              key={index}
              href={part.href}
              className="cursor-pointer font-semibold text-brand underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover focus-visible:rounded-4 focus-visible:outline-2 focus-visible:outline-brand"
            >
              {part.text}
            </a>
          ),
        )}
      </p>
    </Dialog>
  );
}
