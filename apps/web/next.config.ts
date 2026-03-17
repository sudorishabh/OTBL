import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/trpc/:path*',
        destination: 'http://server:7200/trpc/:path*',
      },
    ]
  },
};

export default nextConfig;
