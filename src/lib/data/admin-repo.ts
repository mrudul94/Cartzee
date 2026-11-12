import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { seedCategories } from "@/lib/seed/categories";
import type { Faq, Order, OrderStatus, Product, Spec } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/types";
import { store } from "./seed-store";
import { fail, loadCategories, ORDER_COLUMNS, toOrder, toProducts, UUID, type OrderRow, type ProductRow } from "./supabase-repo";
import { svc } from "./supabase-clients";

/** Product with admin-only fields (supplier link/cost, price-check date, visibility). */
export type AdminProduct = Product & { meeshoUrl: string; meeshoPrice: number; priceCheckedAt: string; isActive: boolean };

export type ProductInput = {
  id?: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
  title: string;
  summary: string;
  description: string;
  howToUse: string[];
  specs: Spec[];
  material: string;
  colour: string;
  price: number;
  mrp: number;
  meeshoUrl: string;
  meeshoPrice: number;
  /** Stamp price_checked_at = now (admin confirmed the Meesho price today). */
  priceChecked: boolean;
  stock: number;
  isBestseller: boolean;
  isFlashSale: boolean;
  isActive: boolean;
  faqs: Faq[];
  seoTitle?: string;
  seoDescription?: string;
  images: { src: string; alt: string }[];
};

/** Admin-facing problem (bad input, duplicate slug); message is shown in the UI. */
export class AdminError extends Error {}

export interface AdminRepo {
  listOrders(status?: OrderStatus): Promise<Order[]>;
  orderCounts(): Promise<Record<OrderStatus, number>>;
  listProducts(): Promise<AdminProduct[]>;
  getProduct(id: string): Promise<AdminProduct | null>;
  saveProduct(input: ProductInput): Promise<AdminProduct>;
  markPriceChecked(id: string): Promise<void>;
  uploadImage(file: File, slug: string): Promise<string>;
}

const emptyCounts = () => Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function checkImage(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) throw new AdminError("Upload a JPG, PNG, WebP or AVIF image");
  if (file.size > MAX_IMAGE_BYTES) throw new AdminError("Images must be 5 MB or smaller");
}

function checkCategories(input: ProductInput, cats: { slug: string; parentSlug: string | null }[]) {
  const sub = cats.find((c) => c.slug === input.subcategorySlug);
  if (!cats.some((c) => c.slug === input.categorySlug && !c.parentSlug)) throw new AdminError("Choose a valid category");
  if (!sub || sub.parentSlug !== input.categorySlug) throw new AdminError("Subcategory must belong to the chosen category");
}

/* ================================================================== seed (mock mode) */

const seedAdmin: AdminRepo = {
  async listOrders(status) {
    return [...store.orders.values()]
      .filter((o) => !status || o.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async orderCounts() {
    const c = emptyCounts();
    for (const o of store.orders.values()) c[o.status]++;
    return c;
  },
  async listProducts() {
    return store.products.map(toAdmin);
  },
  async getProduct(id) {
    const p = store.products.find((x) => x.id === id);
    return p ? toAdmin(p) : null;
  },
  async saveProduct(input) {
    checkCategories(input, seedCategories);
    if (store.products.some((p) => p.slug === input.slug && p.id !== input.id)) throw new AdminError(`The URL slug "${input.slug}" is already used`);
    const existing = input.id ? store.products.find((p) => p.id === input.id) : undefined;
    if (input.id && !existing) throw new AdminError("Product not found");
    const now = new Date().toISOString();
    const next = {
      ...(existing ?? { id: `prd_${Date.now().toString(36)}`, rating: 0, reviewCount: 0, createdAt: now }),
      slug: input.slug,
      categorySlug: input.categorySlug,
      subcategorySlug: input.subcategorySlug,
      title: input.title,
      summary: input.summary,
      description: input.description,
      howToUse: input.howToUse,
      specs: input.specs,
      material: input.material,
      colour: input.colour,
      price: input.price,
      mrp: input.mrp,
      meeshoUrl: input.meeshoUrl,
      meeshoPrice: input.meeshoPrice,
      priceCheckedAt: input.priceChecked ? now : (existing?.priceCheckedAt ?? now),
      stock: input.stock,
      isBestseller: input.isBestseller,
      isFlashSale: input.isFlashSale,
      isActive: input.isActive,
      faqs: input.faqs,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      images: input.images,
    };
    if (existing) Object.assign(existing, next);
    else store.products.push(next);
    return toAdmin(next);
  },
  async markPriceChecked(id) {
    const p = store.products.find((x) => x.id === id);
    if (p) p.priceCheckedAt = new Date().toISOString();
  },
  async uploadImage() {
    throw new AdminError("Image upload needs Supabase Storage. Connect Supabase, or enter an image path such as /placeholders/… for now.");
  },
};

function toAdmin(p: Product & { isActive?: boolean }): AdminProduct {
  return {
    ...p,
    meeshoUrl: p.meeshoUrl ?? "",
    meeshoPrice: p.meeshoPrice ?? 0,
    priceCheckedAt: p.priceCheckedAt ?? p.createdAt,
    isActive: p.isActive ?? true,
  };
}

/* ================================================================== supabase */

type AdminProductRow = ProductRow & { meesho_url: string; meesho_price: number; price_checked_at: string; is_active: boolean };
const BUCKET = "product-images";

async function toAdminProducts(rows: AdminProductRow[]): Promise<AdminProduct[]> {
  const base = await toProducts(rows);
  return base.map((p, i) => {
    const r = rows[i]!;
    return { ...p, meeshoUrl: r.meesho_url, meeshoPrice: Number(r.meesho_price), priceCheckedAt: r.price_checked_at, isActive: r.is_active };
  });
}

const supabaseAdmin: AdminRepo = {
  async listOrders(status) {
    let q = svc().from("orders").select(ORDER_COLUMNS).order("created_at", { ascending: false }).limit(300);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) fail("admin orders", error);
    return (data as OrderRow[]).map(toOrder);
  },
  async orderCounts() {
    const { data, error } = await svc().from("orders").select("status").limit(10000);
    if (error) fail("order counts", error);
    const c = emptyCounts();
    for (const r of data as { status: OrderStatus }[]) c[r.status]++;
    return c;
  },
  async listProducts() {
    const { data, error } = await svc().from("products").select("*, product_images(src, alt, sort_order)").order("created_at");
    if (error) fail("admin products", error);
    return toAdminProducts(data as AdminProductRow[]);
  },
  async getProduct(id) {
    if (!UUID.test(id)) return null;
    const { data, error } = await svc().from("products").select("*, product_images(src, alt, sort_order)").eq("id", id).maybeSingle();
    if (error) fail("admin product", error);
    return data ? ((await toAdminProducts([data as AdminProductRow]))[0] ?? null) : null;
  },
  async saveProduct(input) {
    const cats = await loadCategories();
    checkCategories(input, cats);
    const idOf = (slug: string) => cats.find((c) => c.slug === slug)!.id;
    const row = {
      slug: input.slug,
      category_id: idOf(input.categorySlug),
      subcategory_id: idOf(input.subcategorySlug),
      title: input.title,
      summary: input.summary,
      description: input.description,
      how_to_use: input.howToUse,
      specs: input.specs,
      material: input.material,
      colour: input.colour,
      price: input.price,
      mrp: input.mrp,
      meesho_url: input.meeshoUrl,
      meesho_price: input.meeshoPrice,
      stock: input.stock,
      is_bestseller: input.isBestseller,
      is_flash_sale: input.isFlashSale,
      is_active: input.isActive,
      faqs: input.faqs,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      ...(input.priceChecked || !input.id ? { price_checked_at: new Date().toISOString() } : {}),
    };
    const res = input.id
      ? await svc().from("products").update(row).eq("id", input.id).select("id").single()
      : await svc().from("products").insert(row).select("id").single();
    if (res.error) {
      if (res.error.code === "23505") throw new AdminError(`The URL slug "${input.slug}" is already used`);
      if (res.error.code === "23514") throw new AdminError("Check prices: MRP must be at least the selling price, and prices must be positive");
      fail("save product", res.error);
    }
    const id = (res.data as { id: string }).id;

    const del = await svc().from("product_images").delete().eq("product_id", id);
    if (del.error) fail("clear images", del.error);
    if (input.images.length) {
      const ins = await svc().from("product_images").insert(input.images.map((img, i) => ({ product_id: id, src: img.src, alt: img.alt, sort_order: i })));
      if (ins.error) fail("save images", ins.error);
    }
    const saved = await supabaseAdmin.getProduct(id);
    if (!saved) throw new Error("Product saved but could not be read back");
    return saved;
  },
  async markPriceChecked(id) {
    const { error } = await svc().from("products").update({ price_checked_at: new Date().toISOString() }).eq("id", id);
    if (error) fail("mark price checked", error);
  },
  async uploadImage(file, slug) {
    checkImage(file);
    const storage = svc().storage;
    const bucket = await storage.getBucket(BUCKET);
    if (bucket.error) {
      const created = await storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_IMAGE_BYTES, allowedMimeTypes: IMAGE_TYPES });
      if (created.error && !/already exists/i.test(created.error.message)) throw new Error(`Could not create storage bucket: ${created.error.message}`);
    }
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `products/${slug || "new"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (up.error) throw new Error(`Upload failed: ${up.error.message}`);
    return storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },
};

export const adminRepo: AdminRepo = isSupabaseConfigured ? supabaseAdmin : seedAdmin;
export { checkImage };
