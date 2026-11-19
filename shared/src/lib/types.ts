export type Faq = { q: string; a: string };
export type Spec = { label: string; value: string };

export type Category = {
  id: string;
  slug: string;
  name: string;
  /** Clothing: products in this category (or its subcategories) must list sizes. */
  hasSizes?: boolean;
  /** null for top-level categories; parent slug for subcategories. */
  parentSlug: string | null;
  /** 1–2 sentence direct answer shown at the top of the category page (AEO). */
  intro: string;
  /** Short copy used in the "Why choose City Seller" blurbs. */
  blurb: string;
  image: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  faqs: Faq[];
};

export type Product = {
  id: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
  title: string;
  /** One-line "what it is / who it's for" answer (AEO). */
  summary: string;
  description: string;
  howToUse: string[];
  specs: Spec[];
  material: string;
  colour: string;
  price: number;
  mrp: number;
  /** Supplier data: present only for server-side/admin reads, never sent to the browser. */
  meeshoUrl?: string;
  meeshoPrice?: number;
  priceCheckedAt?: string;
  rating: number;
  reviewCount: number;
  /** Paid orders (not cancelled or returned) that included this product. */
  boughtCount?: number;
  /** Clothing sizes (e.g. S, M, L). When set, shoppers must choose one. */
  sizes?: string[];
  stock: number;
  isBestseller: boolean;
  isFlashSale: boolean;
  /** "New" badge override: true = always, false = never, null/undefined = automatic (added in the last 30 days). */
  isNew?: boolean | null;
  images: { src: string; alt: string }[];
  faqs: Faq[];
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  createdAt: string;
  verified: boolean;
  /** The shop's public reply, if any. */
  reply?: string;
};

export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "products"; slugs: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: PostBlock[];
  faqs: Faq[];
  cover: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
};

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "placed_on_meesho",
  "shipped",
  "delivered",
  "cancelled_refunded",
  "return_requested",
  "returned_refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Address = {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItem = {
  productId: string;
  slug: string;
  path: string;
  title: string;
  image: string;
  quantity: number;
  /** Chosen size for clothing ("" or undefined when the product has no sizes). */
  size?: string;
  /** Locked at order time. */
  unitPrice: number;
  unitMrp: number;
  meeshoPrice: number;
  meeshoUrl: string;
};

export type OrderEvent = { status: OrderStatus; at: string; note?: string };

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  meeshoOrderId?: string;
  meeshoCost?: number;
  trackingUrl?: string;
  events: OrderEvent[];
  /** Signed-in shopper who placed the order (customer account). */
  customerUserId?: string;
  createdAt: string;
};
