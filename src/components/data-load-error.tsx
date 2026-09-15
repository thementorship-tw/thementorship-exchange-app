import { Tray } from "@phosphor-icons/react/ssr";

export type DataLoadErrorProps = {
  className?: string;
  description?: string;
  title?: string;
};

/** 頁面或區塊資料載入失敗時的共用狀態。 */
export function DataLoadError({
  className = "",
  description = "伺服器暫時沒有回應，稍後再試一次。如果持續發生，請回報專案小組。",
  title = "資料載入失敗",
}: DataLoadErrorProps) {
  return (
    <div
      role="alert"
      className={`flex min-h-64 flex-col items-center justify-center rounded-20 bg-glass px-6 py-12 text-center ${className}`}
    >
      <span className="flex size-14 items-center justify-center rounded-pill bg-error-subtle text-error">
        <Tray
          aria-hidden="true"
          className="size-7"
        />
      </span>
      <h2 className="mt-4 text-h2 text-primary">{title}</h2>
      <p className="mt-4 max-w-2xl text-body text-secondary">{description}</p>
    </div>
  );
}
