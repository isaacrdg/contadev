import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.app.github.dev"
  ],
  serverExternalPackages: ["@keystatic/core", "@keystatic/next"],
};

export default nextConfig;
