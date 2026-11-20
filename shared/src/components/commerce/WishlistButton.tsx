"use client";

import { Heart } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { useHydrated } from "@/hooks/useHydrated";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils/cn";

/** Heart toggle that saves a product to this device's wishlist (no sign-in needed). */
export function WishlistButton({ slug, title, className }: { slug: string; title: string; className?: string }) {
  const hydrated = useHydrated();
  const on = useWishlist((s) => s.slugs.includes(slug)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(slug);
        toast({ tone: "success", title: added ? "Saved to your wishlist" : "Removed from your wishlist" });
      }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm transition-colors duration-fast hover:bg-surface focus-visible:outline-none focus-visible:shadow-focus",
        on ? "text-primary" : "text-text-muted hover:text-primary",
        className,
      )}
    >
      <Heart aria-hidden className="h-5 w-5" fill={on ? "currentColor" : "none"} />
    </button>
  );
}
