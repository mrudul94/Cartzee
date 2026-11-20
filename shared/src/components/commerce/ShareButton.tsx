"use client";

import { Share2 } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

/** Shares the product link (phone share sheet), or copies it where sharing isn't available. */
export function ShareButton({ title, path, className }: { title: string; path: string; className?: string }) {
  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ tone: "success", title: "Link copied", description: "Paste it anywhere to share this product." });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // closed the share sheet
      toast({ tone: "error", title: "Couldn't share", description: url });
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      aria-label={`Share ${title}`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-text-muted shadow-sm transition-colors duration-fast hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:shadow-focus",
        className,
      )}
    >
      <Share2 aria-hidden className="h-5 w-5" />
    </button>
  );
}
