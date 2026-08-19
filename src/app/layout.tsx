import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Mentorship Exchange",
  description: "Mentorship exchange platform",
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
