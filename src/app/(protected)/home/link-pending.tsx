"use client";

import { useLinkStatus } from "next/link";

/**
 * 放在 <Link> 內部使用，導覽進行中時把連結蓋淡。
 *
 * 這個路由是動態的（要驗身分又吃 searchParams），prefetch 不會有完整內容，
 * 沒有這層回饋使用者會以為沒按到。用固定尺寸的疊層切換透明度，不造成位移。
 */
export function LinkPending() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-pill bg-page transition-opacity ${pending ? "opacity-50" : "opacity-0"}`}
    />
  );
}
