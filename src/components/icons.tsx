import type { ReactNode } from "react";

type IconProps = {
  /** Use only for sizing and color, e.g. `size-5 text-secondary`. */
  className?: string;
};

/** 共用線條圖示；尺寸與顏色一律由 className 的 size-* 與 text-* 控制。 */
function Icon({
  className = "",
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle
        cx="11"
        cy="11"
        r="6.5"
      />
      <path d="m16 16 4.5 4.5" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.25 10a5.75 5.75 0 0 1 11.5 0c0 4.25 1.75 5.5 1.75 5.5H4.5s1.75-1.25 1.75-5.5Z" />
      <path d="M9.75 18.5a2.25 2.25 0 0 0 4.5 0" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle
        cx="12"
        cy="12"
        r="3.25"
      />
      <path d="M12 2.75v2.25M12 19v2.25M21.25 12H19M5 12H2.75M18.55 5.45 16.95 7.05M7.05 16.95l-1.6 1.6M18.55 18.55l-1.6-1.6M7.05 7.05l-1.6-1.6" />
    </Icon>
  );
}

/** 排序圖示；descending 對應「最新的」，ascending 對應「最舊的」。 */
export function SortIcon({
  direction = "descending",
  ...props
}: IconProps & { direction?: "ascending" | "descending" }) {
  const descending = direction === "descending";

  return (
    <Icon {...props}>
      <path d={descending ? "M4 7h9M4 12h6M4 17h3" : "M4 7h3M4 12h6M4 17h9"} />
      {descending ? (
        <path d="M17.5 6v12M17.5 18l3-3M17.5 18l-3-3" />
      ) : (
        <path d="M17.5 18V6M17.5 6l3 3M17.5 6l-3 3" />
      )}
    </Icon>
  );
}

export function CaretDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5.5 12.5 4 4 9-9" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}
