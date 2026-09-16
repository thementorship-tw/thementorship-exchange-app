"use client";

import { Bell, UserCircleGear } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** 功能選單；桌機側欄與手機抽屜共用。 */
export function HomeNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const navItems = [
    {
      label: "系統通知",
      href: "/notifications",
      Icon: Bell,
      unread: unreadCount > 0,
    },
    { label: "設定中心", href: null, Icon: UserCircleGear },
  ];

  return (
    <nav aria-label="功能選單">
      <ul className="flex flex-col">
        {navItems.map(({ label, href, Icon, unread }) => {
          const active =
            href !== null &&
            (pathname === href || pathname.startsWith(`${href}/`));

          return (
            <li key={label}>
              {href === null ? (
                // TODO: 設定中心路由尚未實作。
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-12 p-4 text-body-strong text-secondary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              ) : (
                <Link
                  href={href}
                  className={`flex w-full items-center gap-2 rounded-12 p-4 text-body-strong transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand ${active ? "bg-brand-subtle text-primary" : "text-secondary"}`}
                  aria-current={active ? "page" : undefined}
                  aria-label={unread ? `${label}，有未讀通知` : undefined}
                >
                  <Icon className="size-5" />
                  {label}
                  {unread && (
                    <span
                      aria-hidden="true"
                      className="ml-auto size-2 rounded-pill bg-gold-strong"
                    />
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
