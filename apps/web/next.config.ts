import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";

const appDir = dirname(fileURLToPath(import.meta.url));
const workspaceEnvPath = resolve(appDir, "../../.env.local");

if (existsSync(workspaceEnvPath)) {
  loadEnv({ path: workspaceEnvPath, override: false, quiet: true });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true
  },
  transpilePackages: [
    "@xreviews/config",
    "@xreviews/db",
    "@xreviews/shared",
    "@xreviews/validators"
  ]
};

export default nextConfig;
