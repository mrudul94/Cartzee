import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/Toast";
import { color } from "@/design-system/tokens";
import { site } from "@/lib/site";
import "@/styles/globals.css";

const heading = Fraunces({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Home Needs Online at Honest Prices`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
  // Google Search Console HTML-tag verification (Settings → Ownership verification).
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: color.background, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${heading.variable} ${body.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
