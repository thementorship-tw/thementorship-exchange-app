import Image from "next/image";

import { Button } from "@/components/button";

import type { SettingsProfile } from "./settings-mock-data";

export function SettingsProfileHeader({
  profile,
}: {
  profile: SettingsProfile;
}) {
  return (
    <header className="flex flex-col gap-4 md:landscape:flex-row md:landscape:items-center lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3 py-1">
        {profile.avatarUrl === null ? (
          <span className="size-8 shrink-0 rounded-pill bg-blue-9" />
        ) : (
          <Image
            src={profile.avatarUrl}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-pill object-cover"
          />
        )}
        <p className="truncate text-h2 text-primary">{profile.googleName}</p>
        <p className="shrink-0 text-h2 text-gold">{profile.group}</p>
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-3 md:landscape:justify-end lg:justify-end">
        <span className="text-body-lg-strong text-secondary">顯示暱稱</span>
        <span className="text-body-lg text-primary">{profile.nickname}</span>
        <Button
          variant="secondary"
          size="sm"
          disabled
          aria-disabled="true"
          title="尚未開放"
        >
          修改
        </Button>
      </div>
    </header>
  );
}
