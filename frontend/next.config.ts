import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this directory so Turbopack stops walking up
  // and accidentally picking the user's ~/pnpm-lock.yaml as the root —
  // which makes Next look for .env files in the wrong place.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
