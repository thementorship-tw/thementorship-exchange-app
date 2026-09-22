"use client";

import { type ReactNode, useEffect, useEffectEvent, useRef } from "react";

type ToastVariant = "info" | "success" | "error";

export type ToastProps = {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  duration?: number;
  variant?: ToastVariant;
  /** 首頁桌機版可避開側欄，改以右側卡片內容區置中。 */
  placement?: "viewport" | "homeContent";
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
  placement = "viewport",
}: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  const closeToast = useEffectEvent(onClose); // React 19 的 useEffectEvent（1. closeToast 在 effect 中維持穩定，不會因父元件 re-render 讓 timer 重建。 2. 呼叫時仍會取得最新的 onClose，不會發生閉包保留舊 callback 的問題。）

  useEffect(() => {
    if (!open) return;

    const toast = toastRef.current;
    if (toast && !toast.matches(":popover-open")) toast.showPopover();

    const timeout = window.setTimeout(closeToast, duration); // 讓 effect 不必追蹤 onClose 的變化，但真正執行時，仍會呼叫最新的 onClose
    return () => window.clearTimeout(timeout);
  }, [duration, open]);

  if (!open) return null;

  const horizontalPosition =
    placement === "homeContent"
      ? "left-1/2 md:landscape:left-[calc(50%+9.9375rem)] lg:left-[calc(50%+9.9375rem)]"
      : "left-1/2";

  return (
    <div
      ref={toastRef}
      popover="manual"
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`pointer-events-none fixed top-6 right-auto bottom-auto z-[100] m-0 w-[calc(100%-2rem)] -translate-x-1/2 border-0 bg-transparent p-0 text-center sm:w-auto ${horizontalPosition}`}
    >
      <div
        className={`inline-flex min-h-10 items-center justify-center rounded-pill px-5 py-2 text-body-strong shadow-md motion-safe:animate-[toast-in_180ms_ease-out] ${variantClasses[variant]}`}
      >
        {children}
      </div>
    </div>
  );
}
