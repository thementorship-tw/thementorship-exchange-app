import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-brand bg-brand text-inverse hover:bg-[#080d43] focus-visible:outline-brand",
  secondary:
    "border border-line bg-surface text-primary hover:bg-surface-subtle focus-visible:outline-brand",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-5 text-body-strong",
  md: "min-h-12 px-6 text-body-lg-strong",
  lg: "min-h-14 px-8 text-body-lg-strong",
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-pill shadow-sm transition enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
