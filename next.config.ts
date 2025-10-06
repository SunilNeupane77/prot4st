import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
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
