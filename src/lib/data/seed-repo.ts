import "server-only";
import { seedCategories } from "@/lib/seed/categories";
import { seedPosts } from "@/lib/seed/posts";
import { seedProducts } from "@/lib/seed/products";
import { seedReviews } from "@/lib/seed/reviews";
import type { Order, OrderItem } from "@/lib/types";
import { shippingFor } from "@/lib/utils/delivery";
import { paths } from "@/lib/utils/paths";
import type { ProductQuery, Repo } from "./repo";

/**
 * Development repository backed by seed files and an in-memory order store.
 * Orders live on globalThis so they survive dev hot reloads (lost on server restart).
 */
const g = globalThis as unknown as { __citySellerOrders?: Map<string, Order> };
const orders = (g.__citySellerOrders ??= new Map<string, Order>());

const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);

function matches(q: string, haystack: string) {
  const words = tokens(haystack);
  return tokens(q).every((t) => words.some((w) => w.startsWith(t) || (t.length > 3 && w.startsWith(t.replace(/s$/, "")))));
}

function applyQuery(query: ProductQuery = {}) {
  let list = seedProducts.filter((p) => {
    if (query.category && p.categorySlug !== query.category) return false;
    if (query.subcategory && p.subcategorySlug !== query.subcategory) return false;
    if (query.minPrice !== undefined && p.price < query.minPrice) return false;
    if (query.maxPrice !== undefined && p.price > query.maxPrice) return false;
    if (query.bestseller && !p.isBestseller) return false;
    if (query.flashSale && !p.isFlashSale) return false;
    if (query.slugs && !query.slugs.includes(p.slug)) return false;
    if (query.ids && !query.ids.includes(p.id)) return false;
    if (query.q) {
      const cat = seedCategories.find((c) => c.slug === p.categorySlug)?.name ?? "";
      const sub = seedCategories.find((c) => c.slug === p.subcategorySlug)?.name ?? "";
      if (!matches(query.q, `${p.title} ${p.summary} ${p.material} ${p.colour} ${cat} ${sub}`)) return false;
    }
    return true;
  });
  if (query.slugs) list = query.slugs.map((s) => list.find((p) => p.slug === s)).filter((p) => p !== undefined);
  return query.limit ? list.slice(0, query.limit) : list;
}

let counter = 1000 + orders.size;
const newId = () => `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const seedRepo: Repo = {
  async listCategories() {
    return seedCategories;
  },
  async getCategory(slug) {
    return seedCategories.find((c) => c.slug === slug) ?? null;
  },
  async listProducts(query) {
    return applyQuery(query);
  },
  async getProductBySlug(slug) {
    return seedProducts.find((p) => p.slug === slug) ?? null;
  },
  async listReviews(productId) {
    return seedReviews.filter((r) => r.productId === productId);
  },
  async listPosts() {
    return [...seedPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  async getPost(slug) {
    return seedPosts.find((p) => p.slug === slug) ?? null;
  },
  async createOrder({ address, items }) {
    const lines: OrderItem[] = items.map(({ productId, quantity }) => {
      const p = seedProducts.find((x) => x.id === productId);
      if (!p) throw new Error(`Unknown product ${productId}`);
      if (p.stock < quantity) throw new Error(`${p.title} is out of stock`);
      return {
        productId: p.id,
        slug: p.slug,
        path: paths.product(p),
        title: p.title,
        image: p.images[0]?.src ?? "",
        quantity,
        unitPrice: p.price,
        unitMrp: p.mrp,
        meeshoPrice: p.meeshoPrice,
        meeshoUrl: p.meeshoUrl,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const shipping = shippingFor(subtotal);
    const now = new Date().toISOString();
    const order: Order = {
      id: newId(),
      number: `CS${++counter}`,
      status: "pending_payment",
      address,
      items: lines,
      subtotal,
      shipping,
      discount: 0,
      total: subtotal + shipping,
      events: [{ status: "pending_payment", at: now }],
      createdAt: now,
    };
    orders.set(order.id, order);
    return order;
  },
  async getOrder(id) {
    return orders.get(id) ?? null;
  },
  async findOrderForTracking(number, phone) {
    for (const o of orders.values()) {
      if (o.number.toUpperCase() === number.toUpperCase() && o.address.phone === phone) return o;
    }
    return null;
  },
  async updateOrderStatus(id, status, patch = {}, note) {
    const o = orders.get(id);
    if (!o) return null;
    const updated: Order = { ...o, ...patch, status, events: [...o.events, { status, at: new Date().toISOString(), note }] };
    orders.set(id, updated);
    return updated;
  },
};
