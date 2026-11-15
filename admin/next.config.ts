import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Local dev convenience: also read the repo-root .env.local (app-level env files still work).
const root = path.join(process.cwd(), "..");
loadEnvConfig(root, process.env.NODE_ENV !== "production");

const shopUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Admin website (admin.cityseller.in). Never indexed, cached or framed. */
const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  experimental: {
    externalDir: true,
    // Product photo uploads (max 5 MB, validated server-side) go through a server action.
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  poweredByHeader: false,
  // Sample/placeholder images are served by the shop.
  async rewrites() {
    return [{ source: "/placeholders/:path*", destination: `${shopUrl}/placeholders/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
