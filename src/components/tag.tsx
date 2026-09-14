import { Check } from "@phosphor-icons/react/ssr";
import type { HTMLAttributes } from "react";

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  /** outline 用在篩選列，filled 用在貼文卡片的類型標籤。 */
  variant?: "outline" | "filled";
  active?: boolean;
  /** filled 的底色；white 用在展開的貼文卡片; brand 則用在收起時。 */
  tone?: "brand" | "white";
  className?: string;
};

export function Tag({
  className = "",
  variant = "outline",
  active = false,
  tone = "brand",
  children,
  ...props
}: TagProps) {
  if (variant === "filled") {
    return (
      <span
        className={`flex h-6 items-center rounded-pill px-3 text-caption whitespace-nowrap text-brand ${
          tone === "white" ? "bg-surface" : "bg-brand-subtle"
        } ${className}`.trim()}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`flex h-8 items-center gap-1.5 rounded-pill border pl-4 text-body-strong whitespace-nowrap ${
        active
          ? "border-brand bg-brand pr-3 text-inverse"
          : "border-line bg-surface pr-4 text-primary"
      } ${className}`.trim()}
      {...props}
    >
      {children}
      {active && <Check className="size-4" />}
    </span>
  );
}
