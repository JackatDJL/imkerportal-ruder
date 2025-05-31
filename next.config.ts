/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/.well-known/:path*",
        destination: "/api/2well2know/:path*",
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  experimental: {
    useCache: true,
    // ppr: true,
  },
};

import withVercelToolbar from "@vercel/toolbar/plugins/next";

export default withVercelToolbar()(nextConfig); // Das Soll so / mein got ich musste die Types absuchen für diese Scheiße
