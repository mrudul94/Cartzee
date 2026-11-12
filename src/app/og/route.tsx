import { ImageResponse } from "next/og";
import { color } from "@/design-system/tokens";
import { site } from "@/lib/site";

/**
 * GET /og?title=…&subtitle=… → 1200×630 PNG share image (Open Graph / Twitter / WhatsApp).
 * Used whenever a page has no photo, or only an SVG placeholder (social apps can't show SVG).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // The built-in image font has no ₹ glyph, so write "Rs." in share cards.
  const rupee = (s: string) => s.replace(/₹\s?/g, "Rs. ");
  const title = rupee(searchParams.get("title") ?? site.name).slice(0, 110);
  const subtitle = rupee(searchParams.get("subtitle") ?? site.tagline).slice(0, 140);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: color.background,
          color: color.text,
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill={color.primary} />
            <path d="M7 16 16 8l9 8v9H7z" fill={color.surface} />
            <rect x="13.5" y="18" width="5" height="7" rx="1" fill={color.primary} />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700 }}>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.1 }}>{title}</span>
          <span style={{ fontSize: 30, color: color.textMuted }}>{subtitle}</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26 }}>
          {["Prepaid & secure", "Delivery across India", "Easy returns"].map((t) => (
            <span key={t} style={{ background: color.secondary, borderRadius: 999, padding: "10px 24px" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
