import type { Metadata } from "next";

import { SettingsCenter } from "./settings-center";

export const metadata: Metadata = {
  title: "設定中心｜The Mentorship Exchange",
  description: "管理曼陀號社群帳號與偏好設定。",
};

export default function SettingsPage() {
  return <SettingsCenter />;
}
