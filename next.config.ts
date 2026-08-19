import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
