"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX = 100;

/** localStorage, or a no-op store when it's blocked (private mode, previews). */
export const safeStorage = createJSONStorage(() => {
  try {
    return localStorage;
  } catch {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }
});

type WishlistState = { slugs: string[]; toggle: (slug: string) => boolean; remove: (slug: string) => void; has: (slug: string) => boolean };

/** Wishlist kept on this device (no sign-in needed). Newest first; `toggle` returns true when added. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const on = get().slugs.includes(slug);
        set((s) => ({ slugs: on ? s.slugs.filter((x) => x !== slug) : [slug, ...s.slugs].slice(0, MAX) }));
        return !on;
      },
      remove: (slug) => set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: "cartzee-wishlist", version: 1, storage: safeStorage, partialize: (s) => ({ slugs: s.slugs }) },
  ),
);
