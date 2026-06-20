import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
