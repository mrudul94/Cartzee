import type { Address, Category, Order, OrderStatus, Post, Product, Review } from "@/lib/types";

export type ProductQuery = {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  bestseller?: boolean;
  flashSale?: boolean;
  /** Products showing the New badge, newest first. */
  newArrivals?: boolean;
  slugs?: string[];
  ids?: string[];
  /** Full-text query (Postgres FTS in Supabase; token match in seed). */
  q?: string;
  /** "trending": most bought first (then rating, then newest). Default: admin position, then newest. */
  sort?: "trending";
  limit?: number;
};

export type NewOrderInput = {
  address: Address;
  items: { productId: string; quantity: number; size?: string }[];
  /** Current delivery rules from Admin → Settings; the fee is computed server-side from these. */
  delivery: { freeAbove: number; fee: number };
  /** Signed-in customer placing the order (required on the live shop). */
  userId?: string;
};

export type PaymentConfirmation = {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  /** When given, must equal the order total in paise or the call fails. */
  amountPaise?: number;
};

/** Thrown for problems the customer can fix or should be told about (shown as-is). */
export class OrderError extends Error {}

/**
 * Storage-agnostic data access. Pages and API routes depend only on this interface,
 * so the seed implementation and the Supabase implementation are interchangeable.
 */
export type NewReviewInput = {
  orderId: string;
  productId: string;
  userId: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
};

export interface Repo {
  readonly kind: "seed" | "supabase";
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  listProducts(query?: ProductQuery): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  listReviews(productId: string): Promise<Review[]>;
  /** A shopper's review of a product from one of their delivered orders (held for approval). */
  submitReview(input: NewReviewInput): Promise<void>;
  /** Product ids in an order that already have a review. */
  reviewedProductIds(orderId: string): Promise<string[]>;
  listPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
  /** Re-prices items from the catalogue (never trusts client prices) and creates a pending order. */
  createOrder(input: NewOrderInput): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  findOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null>;
  findOrderForTracking(number: string, phone: string): Promise<Order | null>;
  /** A customer's own orders, newest first (My orders). */
  listOrdersForUser(userId: string): Promise<Order[]>;
  attachRazorpayOrder(orderId: string, razorpayOrderId: string): Promise<void>;
  /** Atomic + idempotent. `changed` is true only for the call that moved the order to paid. */
  markOrderPaid(orderId: string, payment: PaymentConfirmation): Promise<{ order: Order; changed: boolean }>;
  updateOrderStatus(id: string, status: OrderStatus, patch?: Partial<Order>, note?: string): Promise<Order | null>;
}
