import "server-only";
import { seedCategories } from "@/lib/seed/categories";
import { seedPosts } from "@/lib/seed/posts";
import { seedProducts } from "@/lib/seed/products";
import { seedReviews } from "@/lib/seed/reviews";
import type { Category, Order, Post, Product, Review } from "@/lib/types";

/** Product/category/post/review as stored in mock mode, including admin-only flags. */
export type StoredProduct = Product & { isActive: boolean };
export type StoredCategory = Category & { isActive: boolean };
export type StoredPost = Post & { isPublished: boolean };
export type StoredReview = Review & { isApproved: boolean };
export type ActivityEntry = { id: number; actor: string; action: string; target: string; at: string };

type Store = {
  products: StoredProduct[];
  categories: StoredCategory[];
  posts: StoredPost[];
  reviews: StoredReview[];
  orders: Map<string, Order>;
  /** CMS content by key (site_content in Supabase). Missing keys fall back to defaults. */
  content: Map<string, unknown>;
  activity: ActivityEntry[];
};

/**
 * Mutable in-memory data for mock mode (no Supabase). Lives on globalThis so dev hot reloads
 * and route handlers share it; resets on server restart. Admin edits apply here.
 */
const g = globalThis as unknown as { __citySellerStore?: Store };
const existing = g.__citySellerStore;
export const store: Store = (g.__citySellerStore = {
  products: existing?.products ?? seedProducts.map((p) => ({ ...p, images: [...p.images], isActive: true })),
  categories: existing?.categories ?? seedCategories.map((c) => ({ ...c, faqs: [...c.faqs], isActive: true })),
  posts: existing?.posts ?? seedPosts.map((p) => ({ ...p, isPublished: true })),
  reviews: existing?.reviews ?? seedReviews.map((r) => ({ ...r, isApproved: true })),
  orders: existing?.orders ?? new Map(),
  content: existing?.content ?? new Map(),
  activity: existing?.activity ?? [],
});
