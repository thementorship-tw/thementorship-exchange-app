"use client";

import Link from "next/link";
import { List, X } from "@phosphor-icons/react/ssr";
import { useRef } from "react";

import { HomeNav } from "./home-nav";
import { SearchField } from "./search-field";
import { useNotifications } from "../_providers/notification-provider";

export function MobileHeader() {
  const drawerRef = useRef<HTMLDialogElement>(null);
  const { unreadCount } = useNotifications();

  return (
    <header className="flex flex-col gap-4 px-4 pt-3 pb-2 md:landscape:hidden lg:hidden">
      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="開啟選單"
          aria-haspopup="dialog"
          onClick={() => drawerRef.current?.showModal()}
          className="-m-2.5 flex size-11 cursor-pointer items-center justify-center rounded-12 text-primary focus-visible:outline-2 focus-visible:outline-brand"
        >
          <List className="size-6 shrink-0" />
        </button>
        <p className="flex-1 text-body-strong text-primary">
          <Link
            href="/home"
            className="rounded-4 focus-visible:outline-2 focus-visible:outline-brand"
          >
            曼陀號技能交換平台
          </Link>
        </p>
      </div>

      <SearchField />

      <dialog
        ref={drawerRef}
        aria-label="功能選單"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-0 h-dvh max-h-none w-73.5 max-w-[calc(100%-3rem)] bg-surface p-0 text-primary shadow-xl backdrop:bg-overlay"
      >
        <div className="flex h-full flex-col gap-6 p-6">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/home"
              onClick={() => drawerRef.current?.close()}
              className="rounded-4 text-body-strong text-primary focus-visible:outline-2 focus-visible:outline-brand"
            >
              曼陀號技能交換平台
            </Link>
            <button
              type="button"
              aria-label="關閉選單"
              onClick={() => drawerRef.current?.close()}
              className="-m-2.5 flex size-11 cursor-pointer items-center justify-center rounded-12 text-secondary focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X className="size-6 shrink-0" />
            </button>
          </div>

          <HomeNav unreadCount={unreadCount} />
        </div>
      </dialog>
    </header>
  );
}
