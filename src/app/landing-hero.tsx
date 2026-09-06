"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { buttonClassName } from "@/components/button";

/** 游標在按鈕或連結上時要交還系統游標，否則鏡片會蓋住按鈕文字。 */
function isOverControl(target: EventTarget | null) {
  return target instanceof Element && target.closest("a, button") !== null;
}

function moveLensTo(root: HTMLElement, event: PointerEvent) {
  const { left, top } = root.getBoundingClientRect();
  root.style.setProperty("--lens-x", `${event.clientX - left}px`);
  root.style.setProperty("--lens-y", `${event.clientY - top}px`);
}

/** 追蹤游標並寫入 root 的鏡片座標，回傳鏡片這一刻該不該出現。 */
function useLens(rootRef: RefObject<HTMLElement | null>) {
  const [lensVisible, setLensVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    // 觸控裝置沒有鏡片
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const hideLens = () => setLensVisible(false);

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (isOverControl(event.target)) {
        hideLens();
        return;
      }

      moveLensTo(root, event);
      setLensVisible(true);
    };

    window.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerleave", hideLens);
    window.addEventListener("blur", hideLens);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerleave", hideLens);
      window.removeEventListener("blur", hideLens);
    };
  }, [rootRef]);

  return lensVisible;
}

function BlurredBackdrop({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <Image
        src="/images/landing-background.png"
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="scale-110 object-cover object-bottom blur-lg"
      />

      {visible && (
        <>
          <div
            className="absolute inset-0"
            style={{
              clipPath: "circle(var(--lens-r) at var(--lens-x) var(--lens-y))",
            }}
          >
            <Image
              src="/images/landing-background.png"
              alt=""
              fill
              loading="eager"
              sizes="100vw"
              className="scale-110 object-cover object-bottom"
            />
          </div>

          {/* 鏡片的樣式 */}
          <div
            className="absolute rounded-pill shadow-[0_24px_60px_rgba(0,0,0,0.45),0_0_28px_4px_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.45)]"
            style={{
              left: "calc(var(--lens-x) - var(--lens-r))",
              top: "calc(var(--lens-y) - var(--lens-r))",
              width: "calc(var(--lens-r) * 2)",
              height: "calc(var(--lens-r) * 2)",
              backgroundImage:
                "radial-gradient(circle closest-side at 50% 50%, rgb(255 255 255 / 0) 78%, rgb(255 255 255 / 0.42) 100%)",
            }}
          />
        </>
      )}
    </div>
  );
}

export function LandingHero({ ctaHref }: { ctaHref: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const lensVisible = useLens(rootRef);

  return (
    <main
      ref={rootRef}
      className={`landing-lens relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-[#1e1e1e] px-6 py-16 text-center ${lensVisible ? "cursor-none" : ""}`}
    >
      <BlurredBackdrop visible={lensVisible} />

      <Image
        src="/logo.png"
        alt="The Mentorship Exchange"
        width={62}
        height={60}
        loading="eager"
        className="mb-6 h-15 w-15.5"
      />

      <h1 className="text-display text-inverse">在航程上，結伴學習不孤單</h1>

      <p className="mt-5 max-w-120 text-h1 text-inverse">
        你可以是老師、是學生，用專長交換專長，交流就是成長的開始。
      </p>

      <Link
        href={ctaHref}
        className={buttonClassName({
          variant: "secondary",
          size: "xl",
          className: "mt-8",
        })}
      >
        開始交換技能
        <span
          aria-hidden="true"
          className="ml-3 flex size-5 items-center justify-center rounded-pill bg-brand"
        >
          <span className="size-1.5 rounded-pill bg-surface" />
        </span>
      </Link>
    </main>
  );
}
