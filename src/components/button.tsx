import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonShape = "pill" | "rounded";

type ButtonStyleProps = {
  /** Use only for external layout such as margin, width, or responsive placement. */
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
};

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> &
  ButtonStyleProps;

const base =
  "inline-flex cursor-pointer items-center justify-center shadow-sm transition enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-brand bg-brand text-inverse hover:bg-[#080d43] focus-visible:outline-brand",
  secondary:
    "border border-line bg-surface text-primary hover:bg-surface-subtle focus-visible:outline-brand",
  accent:
    "border border-gold bg-gold text-inverse hover:bg-gold-strong focus-visible:outline-brand",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-5 text-body-strong",
  md: "min-h-12 px-6 text-body-lg-strong",
  lg: "min-h-14 px-8 text-body-lg-strong",
  xl: "min-h-16 px-8 text-body-lg-strong",
};

const shapeClasses: Record<ButtonShape, string> = {
  pill: "rounded-pill",
  rounded: "rounded-12",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  shape = "pill",
  className = "",
}: ButtonStyleProps = {}) {
  return `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`.trim();
}

export function Button({
  className,
  variant,
  size,
  shape,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, shape, className })}
      {...props}
    />
  );
}
