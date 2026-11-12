import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";
import { NotFoundContent } from "@/components/sections/NotFoundContent";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <StoreShell>
      <NotFoundContent />
    </StoreShell>
  );
}
