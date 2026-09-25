import type { Metadata } from "next";

import { withBasePath } from "@/shared/base-path";

import "./globals.css";

export const metadata: Metadata = {
  title: "The Mentorship Exchange",
  description: "Mentorship exchange platform",
  // metadata 的 manifest 路徑不會自動加 basePath
  manifest: withBasePath("/manifest.json"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
