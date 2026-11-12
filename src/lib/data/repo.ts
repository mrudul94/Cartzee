import type { Address, Category, Order, OrderStatus, Post, Product, Review } from "@/lib/types";

export type ProductQuery = {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  bestseller?: boolean;
  flashSale?: boolean;
  slugs?: string[];
  ids?: string[];
  /** Full-text query (Postgres FTS in Supabase; token match in seed). */
  q?: string;
  limit?: number;
};

export type NewOrderInput = {
  address: Address;
  items: { productId: string; quantity: number }[];
};

/**
 * Storage-agnostic data access. Pages and API routes depend only on this interface,
 * so the seed implementation can be swapped for Supabase without touching UI code.
 */
export interface Repo {
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  listProducts(query?: ProductQuery): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  listReviews(productId: string): Promise<Review[]>;
  listPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
  /** Re-prices items from the catalogue (never trusts client prices) and creates a pending order. */
  createOrder(input: NewOrderInput): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  findOrderForTracking(number: string, phone: string): Promise<Order | null>;
  updateOrderStatus(id: string, status: OrderStatus, patch?: Partial<Order>, note?: string): Promise<Order | null>;
}
