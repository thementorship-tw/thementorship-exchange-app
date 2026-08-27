"use client";

import {
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";

export type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  showCloseButton?: boolean;
};

export function Dialog({
  open,
  title,
  children,
  actions,
  onClose,
  closeLabel = "關閉",
  showCloseButton = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-20 bg-surface p-0 text-primary shadow-xl backdrop:bg-overlay backdrop:backdrop-blur-[1px]"
    >
      <div className="relative p-6 sm:p-8">
        {showCloseButton && (
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-pill text-secondary transition hover:bg-surface-subtle hover:text-primary focus-visible:text-brand focus-visible:outline-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}

        <h2
          id={titleId}
          className={`text-h2 ${showCloseButton ? "pr-10" : ""}`}
        >
          {title}
        </h2>
        <div
          id={descriptionId}
          className="mt-4 text-body-lg text-secondary"
        >
          {children}
        </div>
        {actions && (
          <div className="mt-6 flex justify-end gap-3">{actions}</div>
        )}
      </div>
    </dialog>
  );
}
