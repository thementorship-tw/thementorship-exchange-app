import { Bell, UserCircleGear } from "@phosphor-icons/react/ssr";

/** 功能選單；桌機側欄與手機抽屜共用。 */
export function HomeNav({
  hasUnreadNotifications = false,
}: {
  /** 系統通知有未讀時，在選項右側顯示小圓點。 */
  hasUnreadNotifications?: boolean;
}) {
  const navItems = [
    { label: "系統通知", Icon: Bell, unread: hasUnreadNotifications },
    { label: "設定中心", Icon: UserCircleGear },
  ];

  return (
    <nav aria-label="功能選單">
      <ul className="flex flex-col">
        {navItems.map(({ label, Icon, unread }) => (
          <li key={label}>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-12 p-4 text-body-strong text-secondary transition hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
              aria-label={unread ? `${label}，有未讀通知` : undefined}
            >
              <Icon className="size-5" />
              {label}
              {unread && (
                <span className="ml-auto size-2 rounded-pill bg-gold-strong" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
