// 桌機按鈕、手機按鈕、首頁內容與發文 Dialog 位於不同元件，需要共用同一份開關狀態
"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

type PublishContextValue = {
  publisherOpen: boolean; // 發文 Dialog 是否開啟
  feedRevision: number; // 每次發文成功後遞增，通知列表重新載入
  openPublisher: () => void; // 開啟發文 Dialog
  closePublisher: () => void; // 關閉發文 Dialog
  notifyCreated: () => void; // 通知貼文列表已有新資料
};

const PublishContext = createContext<PublishContextValue | null>(null);

export function usePublishExchange() {
  const value = useContext(PublishContext);
  if (!value) {
    throw new Error(
      "usePublishExchange must be used within PublishExchangeProvider",
    );
  }
  return value;
}

/** 發文期間隱藏首頁內容，但保留掛載狀態，關閉後可回到原本的位置。 */
export function PublishExchangeContent({ children }: { children: ReactNode }) {
  const { publisherOpen } = usePublishExchange();

  return (
    <div
      data-publish-exchange-content
      aria-hidden={publisherOpen || undefined}
      className={`flex min-h-0 min-w-0 flex-1 flex-col ${publisherOpen ? "invisible" : ""}`}
    >
      {children}
    </div>
  );
}

export function PublishExchangeProvider({ children }: { children: ReactNode }) {
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [feedRevision, setFeedRevision] = useState(0);

  return (
    <PublishContext
      value={{
        publisherOpen,
        feedRevision,
        openPublisher: () => setPublisherOpen(true),
        closePublisher: () => setPublisherOpen(false),
        notifyCreated: () => setFeedRevision((revision) => revision + 1),
      }}
    >
      {children}
    </PublishContext>
  );
}
