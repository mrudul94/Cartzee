import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/Toast";
import { color } from "@/design-system/tokens";
import "@/styles/globals.css";

const heading = Fraunces({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

/** Admin website root layout. Never indexed. */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | City Seller Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: color.background, width: "device-width", initialScale: 1 };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${heading.variable} ${body.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
