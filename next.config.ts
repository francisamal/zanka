import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: `v1.0.${Math.floor(Date.now() / 1000)}`,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "dmctisqflcwhnjwkalgw.supabase.co",
      },
    ],
  },
};

export default nextConfig;
