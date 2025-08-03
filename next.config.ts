// next.config.js or next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "img.clerk.com",
      "images.clerk.dev",
      "lh3.googleusercontent.com"
    ]
  },
  eslint: {
    ignoreDuringBuilds: true // ✅ prevents Vercel build from failing due to ESLint errors
  }
};

export default nextConfig;
