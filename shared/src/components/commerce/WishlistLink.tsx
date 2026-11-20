"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useWishlist } from "@/hooks/useWishlist";

/** Header heart: link to the wishlist with a live count. */
export function WishlistLink() {
  const hydrated = useHydrated();
  const count = useWishlist((s) => s.slugs.length);
  const n = hydrated ? count : 0;
  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${n} ${n === 1 ? "item" : "items"}`}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span className="relative">
        <Heart aria-hidden className="h-6 w-6" />
        {n > 0 && (
          <span aria-hidden className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-text-inverse">
            {n}
          </span>
        )}
      </span>
    </Link>
  );
}
