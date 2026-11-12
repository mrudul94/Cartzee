import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemView } from "./DesignSystemView";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

/** Public style guide: development only (or DESIGN_SYSTEM_PUBLIC=true). In production use /admin/design-system. */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production" && process.env.DESIGN_SYSTEM_PUBLIC !== "true") notFound();
  return (
    <main id="main">
      <DesignSystemView />
    </main>
  );
}
