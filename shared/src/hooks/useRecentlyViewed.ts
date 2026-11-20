"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./useWishlist";

const MAX = 20;
export type ViewedItem = { slug: string; category: string };

type RecentState = { items: ViewedItem[]; record: (item: ViewedItem) => void; clear: () => void };

/** Products this shopper opened on this device (newest first, max 20): feeds "Recently viewed" and recommendations. */
export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      record: (item) => set((s) => ({ items: [item, ...s.items.filter((x) => x.slug !== item.slug)].slice(0, MAX) })),
      clear: () => set({ items: [] }),
    }),
    { name: "cartzee-recent", version: 1, storage: safeStorage, partialize: (s) => ({ items: s.items }) },
  ),
);

/** Categories to recommend from, most viewed first. */
export function topCategories(items: ViewedItem[], max = 3): string[] {
  const score = new Map<string, number>();
  items.forEach((it, i) => score.set(it.category, (score.get(it.category) ?? 0) + (MAX - i)));
  return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([c]) => c);
}
