"use client";

export type SettingsTab = "posts" | "sentApplications";

const TAB_ITEMS: { id: SettingsTab; label: string; disabled?: boolean }[] = [
  { id: "posts", label: "我的發文" },
  { id: "sentApplications", label: "我送出的申請", disabled: true },
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
            className={`flex min-h-14 flex-1 cursor-pointer items-center justify-center px-4 py-4 text-body-lg-strong transition focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-45 ${
              index > 0 ? "border-l border-line" : ""
            } ${
              active
                ? "border-b-2 border-brand text-brand"
                : "border-b-2 border-surface-subtle text-primary"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
