import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  poweredByHeader: false,
  // Admin image uploads (max 5 MB, validated in admin-repo) go through a server action.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
