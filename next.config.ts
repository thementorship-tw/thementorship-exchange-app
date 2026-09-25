import type { NextConfig } from "next";

import { BASE_PATH } from "./src/shared/base-path";

const nextConfig: NextConfig = {
  // 透過官網 rewrite 掛在 www.thementorship.tw/exchange 底下，見 src/shared/base-path.ts
  basePath: BASE_PATH,
  images: {
    remotePatterns: [
      // Google OAuth 的 session.user.image 子網域不固定（lh3, lh4, lh5…）
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
