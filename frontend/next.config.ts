import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true, // Optional, helps with file structure
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
