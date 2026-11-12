import "server-only";
import { seedProducts } from "@/lib/seed/products";
import type { Order, Product } from "@/lib/types";

/** Product as stored in mock mode, including admin-only fields. */
export type StoredProduct = Product & { isActive: boolean };

type Store = { products: StoredProduct[]; orders: Map<string, Order> };

/**
 * Mutable in-memory data for mock mode (no Supabase). Lives on globalThis so dev hot reloads
 * and route handlers share it; resets on server restart. Admin edits apply here.
 */
const g = globalThis as unknown as { __citySellerStore?: Store };
export const store: Store = (g.__citySellerStore ??= {
  products: seedProducts.map((p) => ({ ...p, images: [...p.images], isActive: true })),
  orders: new Map(),
});
