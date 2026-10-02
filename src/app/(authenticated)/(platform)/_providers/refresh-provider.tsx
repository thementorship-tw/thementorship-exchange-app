// 底部工具列的重整鍵集中在這裡，讓「重整」對每一頁都是同一件事
"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

type RefreshContextValue = {
  refreshing: boolean;
  refresh: () => void;
  /** 每次重整完成後遞增，用來重新掛載頁面內容。 */
  revision: number;
};

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function useAppRefresh(): RefreshContextValue {
  const value = useContext(RefreshContext);
  if (value === null)
    throw new Error("useAppRefresh must be used within AppRefreshProvider");

  return value;
}

export function AppRefreshProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [revision, setRevision] = useState(0);
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (wasPendingRef.current && !isPending) {
      setRevision((current) => current + 1);
    }
    wasPendingRef.current = isPending;
  }, [isPending]);

  const refresh = useCallback(() => {
    if (isPending) return;

    startTransition(() => {
      router.refresh();
    });
  }, [isPending, router]);

  return (
    <RefreshContext value={{ refreshing: isPending, refresh, revision }}>
      {children}
    </RefreshContext>
  );
}

/** 重整完成後重新掛載頁面內容，讓 client 端的列表重新抓第一頁。 */
export function RefreshBoundary({ children }: { children: ReactNode }) {
  const { revision } = useAppRefresh();

  return <Fragment key={revision}>{children}</Fragment>;
}
