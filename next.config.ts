import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
  async rewrites() {
    return []
  },
  async headers() {
    return []
  }
};

export default nextConfig;
