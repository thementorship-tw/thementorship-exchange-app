import type { ReactNode } from "react";

import { Button } from "@/components/button";

export const OFFLINE_ERROR_TITLE = "目前沒有網路連線";
export const OFFLINE_ERROR_DESCRIPTION =
  "請確認你的網路狀態，連線恢復後再重新整理。";

export const LOAD_FAILED_ERROR_TITLE = "資料載入失敗";
export const LOAD_FAILED_ERROR_DESCRIPTION =
  "伺服器暫時沒有回應，稍後再試一次。如果持續發生，請回報專案小組。";

export function ErrorState({
  image,
  title,
  description,
  onRetry,
}: {
  image: ReactNode;
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-20 bg-glass px-8 py-12 text-center md:landscape:flex-1 lg:flex-1"
    >
      <div className="flex items-center justify-center rounded-pill bg-error-subtle p-4">
        {image}
      </div>
      <p className="text-h2 text-primary">{title}</p>
      <p className="text-body text-secondary">{description}</p>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRetry}
      >
        重新載入
      </Button>
    </div>
  );
}
