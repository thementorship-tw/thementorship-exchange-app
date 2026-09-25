"use client";

export type SettingsTab = "posts" | "sentApplications";

const TAB_ITEMS: { id: SettingsTab; label: string; disabled?: boolean }[] = [
  { id: "posts", label: "我的發文" },
  { id: "sentApplications", label: "我送出的申請" },
];

export function SettingsTabs({
  activeTab,
  onChange,
}: {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="設定中心分頁"
      className="flex overflow-hidden rounded-t-20 bg-glass"
    >
      {TAB_ITEMS.map(({ id, label, disabled }, index) => {
        const active = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`settings-tab-${id}`}
            aria-selected={active}
            aria-controls={`settings-tabpanel-${id}`}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`relative flex min-h-14 flex-1 cursor-pointer items-center justify-center px-4 py-4 text-body-lg-strong transition after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-45 ${
              index > 0 ? "border-l border-line" : ""
            } ${
              active
                ? "text-brand after:bg-brand"
                : "text-primary after:bg-transparent"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
