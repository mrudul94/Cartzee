import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import type { Faq, Order, OrderStatus, Product, Spec } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/types";
import { store } from "@/lib/data/seed-store";
import { fail, loadCategories, ORDER_COLUMNS, toOrder, toProducts, UUID, type OrderRow, type ProductRow } from "@/lib/data/supabase-repo";
import { svc } from "@/lib/data/supabase-clients";

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
  sizes: string[];
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
  /** "New" badge: null = automatic (first 30 days), true = always, false = never. */
  isNew: boolean | null;
  faqs: Faq[];
  seoTitle?: string;
  seoDescription?: string;
  images: { src: string; alt: string }[];
};

/** One-click changes from the product list. */
export type ProductPatch = { stock?: number; isActive?: boolean; isNew?: boolean | null };
export type UploadFolder = "products" | "banners" | "categories" | "guides";

/** Admin-facing problem (bad input, duplicate slug); message is shown in the UI. */
export class AdminError extends Error {}

export interface AdminRepo {
  listOrders(status?: OrderStatus): Promise<Order[]>;
  orderCounts(): Promise<Record<OrderStatus, number>>;
  listProducts(): Promise<AdminProduct[]>;
  getProduct(id: string): Promise<AdminProduct | null>;
  saveProduct(input: ProductInput): Promise<AdminProduct>;
  markPriceChecked(id: string): Promise<void>;
  patchProduct(id: string, patch: ProductPatch): Promise<void>;
  /** Copies a product (hidden, slug + "-copy") so a similar item can be added quickly. */
  duplicateProduct(id: string): Promise<AdminProduct>;
  /** How many orders contain this product (such products can't be deleted, only hidden). */
  productOrderCount(id: string): Promise<number>;
  /** Order counts for every product that has been ordered (product id → number of orders). */
  orderCountsByProduct(): Promise<Map<string, number>>;
  /** Permanently delete a product with its photos and reviews. Refused if any order contains it. */
  deleteProduct(id: string): Promise<void>;
  uploadImage(file: File, slug: string, folder?: UploadFolder): Promise<string>;
}

const IN_ORDERS = (n: number) => `This product is in ${n} order(s), so it can't be deleted (the order history needs it). Hide it instead.`;

const uniqueSlug = (base: string, taken: (s: string) => boolean) => {
  let slug = `${base}-copy`.slice(0, 80);
  for (let n = 2; taken(slug); n++) slug = `${base}-copy-${n}`.slice(0, 80);
  return slug;
};

const emptyCounts = () => Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function checkImage(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) throw new AdminError("Upload a JPG, PNG, WebP or AVIF image");
  if (file.size > MAX_IMAGE_BYTES) throw new AdminError("Images must be 5 MB or smaller");
}

function checkCategories(input: ProductInput, cats: { slug: string; parentSlug: string | null; hasSizes?: boolean }[]) {
  if (!cats.some((c) => c.slug === input.categorySlug && !c.parentSlug)) throw new AdminError("Choose a valid category");
  const clothing = cats.some((c) => (c.slug === input.categorySlug || (input.subcategorySlug && c.slug === input.subcategorySlug)) && c.hasSizes);
  if (clothing && input.sizes.length === 0) throw new AdminError("This is a clothing category: add at least one size.");
  if (input.subcategorySlug) {
    const sub = cats.find((c) => c.slug === input.subcategorySlug);
    if (!sub || sub.parentSlug !== input.categorySlug) throw new AdminError("Subcategory must belong to the chosen category");
  } else if (cats.some((c) => c.slug === input.slug && c.parentSlug === input.categorySlug)) {
    // Without a subcategory the product URL is /<category>/<slug>, which would clash with that subcategory's page.
    throw new AdminError(`The URL "${input.slug}" is already used by a subcategory of this category. Choose a subcategory or change the product URL.`);
  }
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
    checkCategories(input, store.categories);
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
      sizes: input.sizes,
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
      isNew: input.isNew,
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
  async patchProduct(id, patch) {
    const p = store.products.find((x) => x.id === id);
    if (!p) throw new AdminError("Product not found");
    if (patch.stock !== undefined) p.stock = patch.stock;
    if (patch.isActive !== undefined) p.isActive = patch.isActive;
    if (patch.isNew !== undefined) p.isNew = patch.isNew;
  },
  async orderCountsByProduct() {
    const counts = new Map<string, number>();
    for (const o of store.orders.values()) for (const id of new Set(o.items.map((it) => it.productId))) counts.set(id, (counts.get(id) ?? 0) + 1);
    return counts;
  },
  async productOrderCount(id) {
    return [...store.orders.values()].filter((o) => o.items.some((it) => it.productId === id)).length;
  },
  async deleteProduct(id) {
    const i = store.products.findIndex((x) => x.id === id);
    if (i < 0) throw new AdminError("Product not found");
    const n = await this.productOrderCount(id);
    if (n > 0) throw new AdminError(IN_ORDERS(n));
    store.products.splice(i, 1);
  },
  async duplicateProduct(id) {
    const p = store.products.find((x) => x.id === id);
    if (!p) throw new AdminError("Product not found");
    const now = new Date().toISOString();
    const copy = {
      ...p,
      id: `prd_${Date.now().toString(36)}`,
      slug: uniqueSlug(p.slug, (s) => store.products.some((x) => x.slug === s)),
      title: `${p.title} (copy)`.slice(0, 120),
      isActive: false,
      isNew: null,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      priceCheckedAt: now,
      images: [...p.images],
      faqs: [...p.faqs],
    };
    store.products.push(copy);
    return toAdmin(copy);
  },
  async uploadImage() {
    throw new AdminError("Image upload needs Supabase Storage. Connect Supabase, or paste an https:// image link for now.");
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
      subcategory_id: input.subcategorySlug ? idOf(input.subcategorySlug) : null,
      title: input.title,
      summary: input.summary,
      description: input.description,
      how_to_use: input.howToUse,
      specs: input.specs,
      material: input.material,
      sizes: input.sizes,
      colour: input.colour,
      price: input.price,
      mrp: input.mrp,
      meesho_url: input.meeshoUrl,
      meesho_price: input.meeshoPrice,
      stock: input.stock,
      is_bestseller: input.isBestseller,
      is_flash_sale: input.isFlashSale,
      is_active: input.isActive,
      is_new: input.isNew,
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
      if (res.error.code === "23502" && res.error.message.includes("subcategory_id"))
        throw new AdminError("Products without a subcategory need a database update: run supabase/migrations/0007_optional_subcategory.sql in the Supabase SQL Editor, or choose a subcategory.");
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
  async patchProduct(id, patch) {
    const row: Record<string, unknown> = {};
    if (patch.stock !== undefined) row.stock = patch.stock;
    if (patch.isActive !== undefined) row.is_active = patch.isActive;
    if (patch.isNew !== undefined) row.is_new = patch.isNew;
    const { error } = await svc().from("products").update(row).eq("id", id);
    if (error) fail("patch product", error);
  },
  async orderCountsByProduct() {
    const { data, error } = await svc().from("order_items").select("product_id, order_id").limit(100000);
    if (error) fail("order counts by product", error);
    const orders = new Map<string, Set<string>>();
    for (const row of (data ?? []) as { product_id: string; order_id: string }[]) {
      if (!orders.has(row.product_id)) orders.set(row.product_id, new Set());
      orders.get(row.product_id)!.add(row.order_id);
    }
    return new Map([...orders].map(([id, set]) => [id, set.size]));
  },
  async productOrderCount(id) {
    const { data, error } = await svc().from("order_items").select("order_id").eq("product_id", id).limit(10000);
    if (error) fail("product order count", error);
    return new Set((data ?? []).map((r) => r.order_id)).size;
  },
  async deleteProduct(id) {
    const n = await this.productOrderCount(id);
    if (n > 0) throw new AdminError(IN_ORDERS(n));
    // Photos and reviews are removed with the product (on delete cascade).
    const { error, count } = await svc().from("products").delete({ count: "exact" }).eq("id", id);
    if (error) fail("delete product", error);
    if (!count) throw new AdminError("Product not found");
  },
  async duplicateProduct(id) {
    const p = await supabaseAdmin.getProduct(id);
    if (!p) throw new AdminError("Product not found");
    const all = await supabaseAdmin.listProducts();
    return supabaseAdmin.saveProduct({
      ...p,
      id: undefined,
      sizes: p.sizes ?? [],
      slug: uniqueSlug(p.slug, (s) => all.some((x) => x.slug === s)),
      title: `${p.title} (copy)`.slice(0, 120),
      isActive: false,
      isNew: null,
      priceChecked: true,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    });
  },
  async uploadImage(file, slug, folder = "products") {
    checkImage(file);
    const storage = svc().storage;
    const bucket = await storage.getBucket(BUCKET);
    if (bucket.error) {
      const created = await storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_IMAGE_BYTES, allowedMimeTypes: IMAGE_TYPES });
      if (created.error && !/already exists/i.test(created.error.message)) throw new Error(`Could not create storage bucket: ${created.error.message}`);
    }
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `${folder}/${slug || "new"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (up.error) throw new Error(`Upload failed: ${up.error.message}`);
    return storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },
};

export const adminRepo: AdminRepo = isSupabaseConfigured ? supabaseAdmin : seedAdmin;
export { checkImage };
