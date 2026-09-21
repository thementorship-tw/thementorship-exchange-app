"use client";

import { DotsThree } from "@phosphor-icons/react/ssr";
import { useEffect, useId, useRef } from "react";

export function PostActionMenu({
  open,
  onOpenChange,
  onDelist,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelist: () => void;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="貼文操作"
        onClick={() => onOpenChange(!open)}
        className="flex size-6 cursor-pointer items-center justify-center rounded-4 text-secondary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
      >
        <DotsThree
          className="size-6"
          weight="bold"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-10 mt-1 min-w-[100px] overflow-hidden rounded-4 bg-surface-subtle shadow-sm"
        >
          <button
            type="button"
            role="menuitem"
            disabled
            title="尚未開放"
            onClick={() => onOpenChange(false)}
            className="flex w-full cursor-not-allowed items-center justify-center px-4 py-3 text-body-strong text-secondary opacity-45"
          >
            修改
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onDelist();
            }}
            className="flex w-full cursor-pointer items-center justify-center px-4 py-3 text-body-strong text-secondary transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
          >
            下架
          </button>
        </div>
      )}
    </div>
  );
}
