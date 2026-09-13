import { Check } from "lucide-react";
import type { HTMLAttributes } from "react";

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  /** outline 用在篩選列，filled 用在貼文卡片的類型標籤。 */
  variant?: "outline" | "filled";
  active?: boolean;
  className?: string;
};

export function Tag({
  className = "",
  variant = "outline",
  active = false,
  children,
  ...props
}: TagProps) {
  if (variant === "filled") {
    return (
      <span
        className={`flex h-6 items-center rounded-pill bg-brand-subtle px-3 text-caption whitespace-nowrap text-brand ${className}`.trim()}
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
