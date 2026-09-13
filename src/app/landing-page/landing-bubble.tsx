"use client";

import { useEffect, useRef } from "react";

import { Lens } from "./landing-lens";

// 縱向：從下緣外飄到上緣外，單位：容器高度的百分比
const Y_START = 115;
const Y_END = -20;

// 橫向：來回擺動的區間，單位：容器寬度的百分比
const X_MIN = 15;
const X_MAX = 85;

const MIN_SECONDS = 5;
const MAX_SECONDS = 7;

// 路徑上的停靠點
const KEYFRAME_COUNT = 30;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function buildRandomBubblePath(): Keyframe[] {
  const midX = (X_MIN + X_MAX) / 2;
  const swingWidth = ((X_MAX - X_MIN) / 2) * randomBetween(0.5, 1);

  const startAngle = randomBetween(0, 2 * Math.PI);
  const swingCycles = randomBetween(0.75, 1.25); // 一趟來回擺幾次

  return Array.from({ length: KEYFRAME_COUNT }, (_, index) => {
    const progress = index / (KEYFRAME_COUNT - 1); // 現在計算到第幾格
    const angle = startAngle + progress * swingCycles * 2 * Math.PI;

    return {
      "--lens-x": `${midX + swingWidth * Math.sin(angle)}%`,
      "--lens-y": `${Y_START + (Y_END - Y_START) * progress}%`,
    };
  });
}

/** 觸控裝置沒有滑鼠，改用一顆自己往上飄的泡泡 */
export function Bubble() {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = bubbleRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (node === null) return;
    if (reducedMotion) return;

    let animation: Animation | null = null;

    const rise = () => {
      animation?.cancel();
      animation = node.animate(buildRandomBubblePath(), {
        duration: randomBetween(MIN_SECONDS, MAX_SECONDS) * 1000,
        easing: "linear",
      });
      animation.onfinish = rise;
    };

    rise();

    return () => animation?.cancel();
  }, []);

  return (
    <div
      ref={bubbleRef}
      className="landing-bubble absolute inset-0"
    >
      <Lens />
    </div>
  );
}
