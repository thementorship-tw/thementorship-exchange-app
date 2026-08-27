"use client";

import { type ReactNode, useEffect } from "react";

type ToastVariant = "info" | "success" | "error";

export type ToastProps = {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  duration?: number;
  variant?: ToastVariant;
};

const variantClasses: Record<ToastVariant, string> = {
  info: "bg-gold text-inverse",
  success: "bg-success text-inverse",
  error: "bg-error text-inverse",
};

export function Toast({
  open,
  children,
  onClose,
  duration = 3200,
  variant = "info",
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, onClose, open]);

  if (!open) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className="pointer-events-none fixed top-6 left-1/2 z-[100] w-[calc(100%-2rem)] -translate-x-1/2 text-center sm:w-auto"
    >
      <div
        className={`inline-flex min-h-10 items-center justify-center rounded-pill px-5 py-2 text-body-strong shadow-md motion-safe:animate-[toast-in_180ms_ease-out] ${variantClasses[variant]}`}
      >
        {children}
      </div>
    </div>
  );
}
