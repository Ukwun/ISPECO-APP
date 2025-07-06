import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Add all domains that might host your user profile images
    domains: [
      "img.clerk.com",
      "images.clerk.dev",
      "lh3.googleusercontent.com" // Example for Google social logins
    ]
  }
  /* config options here */
};

export default nextConfig;
