import path from "node:path";
import fs from "node:fs";
import * as nextEnvModule from "@next/env";
import type { NextConfig } from "next";

// The package is CommonJS: Next loads this file as CJS, other tools as ESM (export under default).
const nextEnv = nextEnvModule as typeof nextEnvModule & { default?: typeof nextEnvModule };
const processEnv = nextEnv.processEnv ?? nextEnv.default!.processEnv;

// Local dev convenience: also read the repo-root env files. Next has already loaded this app's own
// env files (which win); loadEnvConfig caches its first call, so the root files are parsed directly.
const root = path.join(process.cwd(), "..");
const mode = process.env.NODE_ENV === "production" ? "production" : "development";
processEnv(
  [`.env.${mode}.local`, ".env.local", `.env.${mode}`, ".env"].flatMap((name) => {
    const file = path.join(root, name);
    return fs.existsSync(file) ? [{ path: name, contents: fs.readFileSync(file, "utf8"), env: {} }] : [];
  }),
  root,
);

/** Shop website (cityseller.in). Shared code lives in ../shared and is compiled by this app. */
const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  experimental: { externalDir: true },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      // Supplier product photos pasted as links (uploading your own copy is more reliable).
      { protocol: "https", hostname: "images.meesho.com" },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
