import { OceanScene } from "@/components/ocean-scene";

import { HomeSidebar } from "./home/home-sidebar";
import { NotificationProvider } from "./notifications/notification-context";

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative isolate flex h-dvh flex-col overflow-hidden bg-page">
      <OceanScene boatSide="left" />

      <NotificationProvider>
        <div className="mx-auto flex min-h-0 w-full max-w-360 flex-1 flex-col md:px-6 md:landscape:flex-row md:landscape:gap-6 md:landscape:py-6 lg:flex-row lg:gap-6 lg:px-6 lg:py-6 xl:px-20">
          <HomeSidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </NotificationProvider>
    </main>
  );
}
