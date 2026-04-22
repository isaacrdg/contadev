import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.app.github.dev"
  ],
  images: {
    // OG image vem de /og (rota interna, mas usada como URL absoluta no SEO/render)
    remotePatterns: [
      { protocol: "https", hostname: "contadev-green.vercel.app" },
      { protocol: "https", hostname: "conta-dev.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
