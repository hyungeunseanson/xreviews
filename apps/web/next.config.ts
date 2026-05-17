import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true
  },
  transpilePackages: [
    "@xreviews/config",
    "@xreviews/shared",
    "@xreviews/validators"
  ]
};

export default nextConfig;
