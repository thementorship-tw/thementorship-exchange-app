"use client";

import Image from "next/image";

export function hasPointer() {
  return window.matchMedia("(pointer: fine)").matches; // fine: 滑鼠、觸控板、觸控筆
}

export function readLensRadius(root: HTMLElement) {
  return parseFloat(getComputedStyle(root).getPropertyValue("--lens-r")) || 90;
}

export function Lens() {
  return (
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
          className="scale-110 object-cover object-center md:object-bottom"
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
  );
}
