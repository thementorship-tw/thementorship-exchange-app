// 手機版發文按鈕，僅在手機版顯示
"use client";

import { Plus } from "@phosphor-icons/react/ssr";

import { usePublishExchange } from "../_providers/publish-exchange-provider";

export function PublishExchangeButton() {
  const { openPublisher } = usePublishExchange();

  return (
    <button
      type="button"
      aria-label="我要發文"
      onClick={openPublisher}
      className="fixed right-4 bottom-6 z-20 flex size-12 cursor-pointer items-center justify-center rounded-pill bg-brand text-inverse shadow-lg transition active:translate-y-px focus-visible:outline-2 focus-visible:outline-brand md:landscape:hidden lg:hidden"
    >
      <Plus className="size-6" />
    </button>
  );
}
