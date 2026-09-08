"use client";

import {
  type RefObject,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/button";

import { Bubble } from "./landing-bubble";
import { Lens, hasPointer } from "./landing-lens";

/** 游標在按鈕或連結上時，需還原成系統游標 */
function isOverControl(target: EventTarget | null) {
  return target instanceof Element && target.closest("a, button") !== null;
}

function moveLensTo(root: HTMLElement, event: PointerEvent) {
  const { left, top } = root.getBoundingClientRect();
  root.style.setProperty("--lens-x", `${event.clientX - left}px`);
  root.style.setProperty("--lens-y", `${event.clientY - top}px`);
}

function useLens(rootRef: RefObject<HTMLElement | null>) {
  const [lensVisible, setLensVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    // 觸控裝置沒有鏡片，改用泡泡
    if (!hasPointer()) return;

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

function subscribeToPointerType(onChange: () => void) {
  const query = window.matchMedia("(pointer: fine)");
  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

/** 觸控裝置沒有滑鼠，改成往上飄的泡泡 */
function useCoarsePointer() {
  return useSyncExternalStore(
    subscribeToPointerType,
    () => !hasPointer(),
    () => false,
  );
}

function BlurredBackdrop({ lensVisible }: { lensVisible: boolean }) {
  const coarsePointer = useCoarsePointer();

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
        className="scale-110 object-cover object-center blur-lg md:object-bottom"
      />

      {lensVisible && <Lens />}
      {coarsePointer && <Bubble />}
    </div>
  );
}

export function LandingPage({ ctaHref }: { ctaHref: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const lensVisible = useLens(rootRef);
  const router = useRouter();

  return (
    <main
      ref={rootRef}
      className={`landing-lens relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-[#1e1e1e] px-4 py-16 text-center ${lensVisible ? "cursor-none" : ""}`}
    >
      <BlurredBackdrop lensVisible={lensVisible} />

      <div className="flex w-full max-w-82 flex-col items-center px-5 pt-5">
        <Image
          src="/images/logo.png"
          alt="The Mentorship Exchange"
          width={62}
          height={60}
          loading="eager"
          className="mb-6 h-15 w-15.5"
        />

        <h1 className="text-h1 text-inverse">在航程上，結伴學習不孤單</h1>

        <p className="mt-3 max-w-120 text-body-lg text-inverse">
          你可以是老師、是學生，用專長交換專長，交流就是成長的開始。
        </p>

        <Button
          variant="secondary"
          size="sm"
          className="mt-6 py-3 md:min-h-14 md:px-10.25 md:text-body-lg-strong"
          onClick={() => router.push(ctaHref)}
        >
          開始尋找夥伴
        </Button>
      </div>
    </main>
  );
}
