import type { NextConfig } from "next";

/** Same-origin /trpc proxy target when the browser uses relative URLs (e.g. empty NEXT_PUBLIC_SERVER_URL). Use 127.0.0.1 locally; set TRPC_REWRITE_TARGET=http://server:7200 in Docker if the API host is `server`. */
const trpcRewriteTarget = (
  process.env.TRPC_REWRITE_TARGET ?? "http://127.0.0.1:7200"
).replace(/\/$/, "");

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
        source: "/trpc/:path*",
        destination: `${trpcRewriteTarget}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
