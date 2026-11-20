import "server-only";
import { cache } from "react";
import type { Category, Faq, Order, OrderStatus, Post, PostBlock, Product, Review, Spec } from "@/lib/types";
import { byTrending, isProductNew } from "@/lib/utils/product";
import { OrderError, type ProductQuery, type Repo } from "./repo";
import { pub, svc } from "./supabase-clients";
import { CACHE_TAGS, cached } from "@/lib/cache";

/* ------------------------------------------------------------------ row types */

type CategoryRow = {
  id: string; slug: string; name: string; parent_id: string | null; intro: string; blurb: string; image: string;
  sort_order: number; seo_title: string | null; seo_description: string | null; faqs: Faq[]; has_sizes?: boolean;
};
export type ProductRow = {
  id: string; slug: string; category_id: string; subcategory_id: string; title: string; summary: string; description: string;
  how_to_use: string[]; specs: Spec[]; material: string; colour: string; country_of_origin?: string; quality_certified?: boolean; price: number; mrp: number; rating: number;
  review_count: number; bought_count?: number; sizes?: string[] | null; stock: number; is_bestseller: boolean; is_flash_sale: boolean; is_new: boolean | null; position?: number | null; faqs: Faq[];
  seo_title: string | null; seo_description: string | null; created_at: string;
  product_images: { src: string; alt: string; sort_order: number }[];
};
export type OrderRow = {
  id: string; number: string; status: OrderStatus; address: Order["address"]; subtotal: number; shipping: number; discount: number;
  total: number; razorpay_order_id: string | null; razorpay_payment_id: string | null; meesho_order_id: string | null;
  meesho_cost: number | null; tracking_url: string | null; created_at: string; user_id: string | null;
  order_items: { product_id: string; slug: string; path: string; title: string; image: string; quantity: number; size?: string | null; unit_price: number; unit_mrp: number; meesho_price: number; meesho_url: string }[];
  order_events: { status: OrderStatus; note: string | null; created_at: string }[];
};

export const PRODUCT_COLUMNS =
  "id, slug, category_id, subcategory_id, title, summary, description, how_to_use, specs, material, colour, country_of_origin, quality_certified, price, mrp, rating, review_count, bought_count, sizes, stock, is_bestseller, is_flash_sale, is_new, position, faqs, seo_title, seo_description, created_at, product_images(src, alt, sort_order)";
export const ORDER_COLUMNS = "*, order_items(*), order_events(status, note, created_at)";
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ------------------------------------------------------------------ mapping */

export function fail(context: string, error: { message: string; code?: string } | null): never {
  throw new Error(`Supabase ${context} failed: ${error?.message ?? "unknown error"}`);
}

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await pub().from("categories").select("*").order("sort_order");
  if (error) fail("categories", error);
  const rows = data as CategoryRow[];
  const slugById = new Map(rows.map((r) => [r.id, r.slug]));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    parentSlug: r.parent_id ? (slugById.get(r.parent_id) ?? null) : null,
    hasSizes: r.has_sizes ?? false,
    intro: r.intro,
    blurb: r.blurb,
    image: r.image,
    sortOrder: r.sort_order,
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    faqs: r.faqs ?? [],
  }));
};

/** Categories rarely change: cached across requests (tag "catalog") and deduped per request. */
export const loadCategories = cache(cached(fetchCategories, ["categories"], CACHE_TAGS.catalog));

export async function toProducts(rows: ProductRow[]): Promise<Product[]> {
  const cats = await loadCategories();
  const slug = new Map(cats.map((c) => [c.id, c.slug]));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    categorySlug: slug.get(r.category_id) ?? "",
    subcategorySlug: slug.get(r.subcategory_id) ?? "",
    title: r.title,
    summary: r.summary,
    description: r.description,
    howToUse: r.how_to_use ?? [],
    specs: r.specs ?? [],
    material: r.material,
    colour: r.colour,
    countryOfOrigin: r.country_of_origin ?? "",
    qualityCertified: r.quality_certified ?? false,
    price: Number(r.price),
    mrp: Number(r.mrp),
    rating: Number(r.rating),
    reviewCount: r.review_count,
    boughtCount: r.bought_count ?? 0,
    sizes: r.sizes ?? [],
    stock: r.stock,
    isBestseller: r.is_bestseller,
    isFlashSale: r.is_flash_sale,
    isNew: r.is_new,
    position: r.position ?? null,
    images: [...(r.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map(({ src, alt }) => ({ src, alt })),
    faqs: r.faqs ?? [],
    createdAt: r.created_at,
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
  }));
}

/**
 * Every active product (RLS hides inactive ones), by admin position, then newest first. One query serves all the product lists on
 * a page (bestsellers, category rows, related items…), deduped per request and cached across requests
 * (tag "catalog": cleared by admin saves and when an order is paid). Fine for catalogues up to a few
 * thousand products.
 */
const fetchAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await pub().from("products").select(PRODUCT_COLUMNS).order("position", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
  if (error) fail("products", error);
  return toProducts(data as unknown as ProductRow[]);
};
export const loadAllProducts = cache(cached(fetchAllProducts, ["all-products"], CACHE_TAGS.catalog));

export function toOrder(r: OrderRow): Order {
  return {
    id: r.id,
    number: r.number,
    status: r.status,
    address: r.address,
    items: (r.order_items ?? []).map((i) => ({
      productId: i.product_id,
      slug: i.slug,
      path: i.path,
      title: i.title,
      image: i.image,
      quantity: i.quantity,
      size: i.size || undefined,
      unitPrice: Number(i.unit_price),
      unitMrp: Number(i.unit_mrp),
      meeshoPrice: Number(i.meesho_price),
      meeshoUrl: i.meesho_url,
    })),
    subtotal: Number(r.subtotal),
    shipping: Number(r.shipping),
    discount: Number(r.discount),
    total: Number(r.total),
    razorpayOrderId: r.razorpay_order_id ?? undefined,
    razorpayPaymentId: r.razorpay_payment_id ?? undefined,
    meeshoOrderId: r.meesho_order_id ?? undefined,
    meeshoCost: r.meesho_cost === null ? undefined : Number(r.meesho_cost),
    trackingUrl: r.tracking_url ?? undefined,
    events: [...(r.order_events ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((e) => ({ status: e.status, at: e.created_at, note: e.note ?? undefined })),
    createdAt: r.created_at,
    customerUserId: r.user_id ?? undefined,
  };
}

/** Customer-fixable errors raised by SQL functions use SQLSTATE P0001/P0002. */
export function rpcError(error: { message: string; code?: string }): never {
  if (error.code === "P0001" || error.code === "P0002") throw new OrderError(error.message);
  if (error.code === "22P02") throw new OrderError("A product in your cart is no longer available");
  fail("rpc", error);
}

/* ------------------------------------------------------------------ repo */

export const supabaseRepo: Repo = {
  kind: "supabase",

  listCategories: loadCategories,

  async getCategory(slug) {
    return (await loadCategories()).find((c) => c.slug === slug) ?? null;
  },

  async listProducts(query: ProductQuery = {}) {
    // Search ranking comes from Postgres; everything else filters the cached catalogue in memory.
    const [all, rankedIds] = await Promise.all([
      loadAllProducts(),
      query.q
        ? pub()
            .rpc("search_products", { q: query.q })
            .then(({ data, error }) => {
              if (error) fail("search", error);
              return (data as { id: string }[]).map((r) => r.id);
            })
        : Promise.resolve(undefined),
    ]);
    if (rankedIds && rankedIds.length === 0) return [];

    let list = all.filter(
      (p) =>
        (!query.category || p.categorySlug === query.category) &&
        (!query.subcategory || p.subcategorySlug === query.subcategory) &&
        (query.minPrice === undefined || p.price >= query.minPrice) &&
        (query.maxPrice === undefined || p.price <= query.maxPrice) &&
        (!query.bestseller || p.isBestseller) &&
        (!query.flashSale || p.isFlashSale) &&
        (!query.ids || query.ids.includes(p.id)),
    );
    if (rankedIds) {
      const byId = new Map(list.map((p) => [p.id, p]));
      list = rankedIds.map((id) => byId.get(id)).filter((p) => p !== undefined);
    }
    if (query.slugs) {
      const bySlug = new Map(list.map((p) => [p.slug, p]));
      list = query.slugs.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
    }
    if (query.newArrivals) list = list.filter((p) => isProductNew(p)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (query.sort === "trending") list = [...list].sort(byTrending);
    return query.limit ? list.slice(0, query.limit) : list;
  },

  async getProductBySlug(slug) {
    return (await loadAllProducts()).find((p) => p.slug === slug) ?? null;
  },

  async listReviews(productId) {
    if (!UUID.test(productId)) return [];
    const { data, error } = await pub()
      .from("reviews")
      .select("id, product_id, author, city, rating, title, body, photos, verified, reply, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) fail("reviews", error);
    return (data as { id: string; product_id: string; author: string; city: string; rating: number; title: string; body: string; photos: string[]; verified: boolean; reply: string | null; created_at: string }[]).map(
      (r): Review => ({ id: r.id, productId: r.product_id, author: r.author, city: r.city, rating: r.rating, title: r.title, body: r.body, photos: r.photos ?? [], verified: r.verified, reply: r.reply || undefined, createdAt: r.created_at }),
    );
  },

  async submitReview(input) {
    const { error } = await svc().from("reviews").insert({
      product_id: input.productId,
      order_id: input.orderId,
      user_id: input.userId,
      author: input.author,
      city: input.city,
      rating: input.rating,
      title: input.title,
      body: input.body,
      verified: true,
      is_approved: false,
    });
    if (error?.code === "23505") throw new OrderError("You've already reviewed this item.");
    if (error) fail("submit review", error);
  },

  async reviewedProductIds(orderId) {
    if (!UUID.test(orderId)) return [];
    const { data, error } = await svc().from("reviews").select("product_id").eq("order_id", orderId);
    if (error) fail("order reviews", error);
    return (data as { product_id: string }[]).map((r) => r.product_id);
  },

  async listPosts() {
    const { data, error } = await pub().from("blog_posts").select("*").order("published_at", { ascending: false });
    if (error) fail("posts", error);
    return (data as Record<string, unknown>[]).map(toPost);
  },

  async getPost(slug) {
    const { data, error } = await pub().from("blog_posts").select("*").eq("slug", slug).maybeSingle();
    if (error) fail("post", error);
    return data ? toPost(data as Record<string, unknown>) : null;
  },

  async createOrder({ address, items, delivery, userId }) {
    const { data, error } = await svc().rpc("create_order", {
      p_customer: { name: address.name, phone: address.phone, email: address.email },
      p_address: address,
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity, size: i.size ?? "" })),
      p_free_above: delivery.freeAbove,
      p_shipping_fee: delivery.fee,
    });
    if (error) rpcError(error);
    if (userId) {
      const link = await svc().from("orders").update({ user_id: userId }).eq("id", data as string);
      if (link.error) fail("link order to customer", link.error);
    }
    const order = await supabaseRepo.getOrder(data as string);
    if (!order) throw new Error("Order was created but could not be read back");
    return order;
  },

  async getOrder(id) {
    if (!UUID.test(id)) return null;
    const { data, error } = await svc().from("orders").select(ORDER_COLUMNS).eq("id", id).maybeSingle();
    if (error) fail("order", error);
    return data ? toOrder(data as OrderRow) : null;
  },

  async findOrderByRazorpayOrderId(razorpayOrderId) {
    const { data, error } = await svc().from("orders").select(ORDER_COLUMNS).eq("razorpay_order_id", razorpayOrderId).maybeSingle();
    if (error) fail("order by razorpay id", error);
    return data ? toOrder(data as OrderRow) : null;
  },

  async findOrderForTracking(number, phone) {
    const { data, error } = await svc()
      .from("orders")
      .select(`${ORDER_COLUMNS}, customers!inner(phone)`)
      .eq("number", number.toUpperCase())
      .eq("customers.phone", phone)
      .maybeSingle();
    if (error) fail("tracking", error);
    return data ? toOrder(data as OrderRow) : null;
  },

  async listOrdersForUser(userId) {
    if (!UUID.test(userId)) return [];
    const { data, error } = await svc().from("orders").select(ORDER_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false }).limit(100);
    if (error) fail("customer orders", error);
    return (data as OrderRow[]).map(toOrder);
  },
  async attachRazorpayOrder(orderId, razorpayOrderId) {
    const { error } = await svc().from("orders").update({ razorpay_order_id: razorpayOrderId }).eq("id", orderId);
    if (error) fail("attach razorpay order", error);
  },

  async markOrderPaid(orderId, payment) {
    const { data, error } = await svc().rpc("mark_order_paid", {
      p_order_id: orderId,
      p_razorpay_order_id: payment.razorpayOrderId ?? null,
      p_payment_id: payment.razorpayPaymentId ?? null,
      p_amount_paise: payment.amountPaise ?? null,
    });
    if (error) rpcError(error);
    const row = (data as { order_id: string; changed: boolean }[])[0];
    const order = await supabaseRepo.getOrder(orderId);
    if (!row || !order) throw new OrderError("Order not found");
    return { order, changed: row.changed };
  },

  async updateOrderStatus(id, status, patch = {}, note) {
    const { error } = await svc().rpc("set_order_status", {
      p_order_id: id,
      p_status: status,
      p_patch: { meeshoOrderId: patch.meeshoOrderId, meeshoCost: patch.meeshoCost, trackingUrl: patch.trackingUrl },
      p_note: note ?? null,
    });
    if (error) rpcError(error);
    return supabaseRepo.getOrder(id);
  },
};

function toPost(r: Record<string, unknown>): Post {
  return {
    slug: r.slug as string,
    title: r.title as string,
    excerpt: r.excerpt as string,
    body: (r.body as PostBlock[]) ?? [],
    faqs: (r.faqs as Faq[]) ?? [],
    cover: r.cover as string,
    author: r.author as string,
    publishedAt: (r.published_at as string) ?? (r.updated_at as string),
    updatedAt: r.updated_at as string,
  };
}
