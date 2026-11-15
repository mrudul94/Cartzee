import "server-only";
import type { Order, OrderItem, Product } from "@/lib/types";
import { shippingFor } from "@/lib/utils/delivery";
import { paths } from "@/lib/utils/paths";
import { isProductNew } from "@/lib/utils/product";
import { OrderError, type ProductQuery, type Repo } from "./repo";
import { store, type StoredCategory, type StoredPost, type StoredProduct, type StoredReview } from "./seed-store";

/**
 * Development repository backed by the in-memory seed store (see seed-store.ts).
 * Storefront reads see active products only and never receive supplier fields' changes
 * beyond what Product carries; admin writes go through admin-repo.ts.
 */
const orders = store.orders;
const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);

function matches(q: string, haystack: string) {
  const words = tokens(haystack);
  return tokens(q).every((t) => words.some((w) => w.startsWith(t) || (t.length > 3 && w.startsWith(t.replace(/s$/, "")))));
}

/** Storefront views of stored rows (drop admin-only flags; hide inactive/unpublished/unapproved). */
const publicView = ({ isActive: _active, ...p }: StoredProduct): Product => p;
const active = () => store.products.filter((p) => p.isActive);
const visibleCategories = () =>
  store.categories
    .filter((c) => c.isActive && (!c.parentSlug || store.categories.some((p) => p.slug === c.parentSlug && p.isActive)))
    .map(({ isActive: _a, ...c }: StoredCategory) => c)
    .sort((a, b) => a.sortOrder - b.sortOrder);
const publishedPosts = () => store.posts.filter((p) => p.isPublished).map(({ isPublished: _p, ...p }: StoredPost) => p);
const approvedReviews = () => store.reviews.filter((r) => r.isApproved).map(({ isApproved: _a, ...r }: StoredReview) => r);

function applyQuery(query: ProductQuery = {}) {
  let list = active().filter((p) => {
    if (query.category && p.categorySlug !== query.category) return false;
    if (query.subcategory && p.subcategorySlug !== query.subcategory) return false;
    if (query.minPrice !== undefined && p.price < query.minPrice) return false;
    if (query.maxPrice !== undefined && p.price > query.maxPrice) return false;
    if (query.bestseller && !p.isBestseller) return false;
    if (query.flashSale && !p.isFlashSale) return false;
    if (query.newArrivals && !isProductNew(p)) return false;
    if (query.slugs && !query.slugs.includes(p.slug)) return false;
    if (query.ids && !query.ids.includes(p.id)) return false;
    if (query.q) {
      const cat = store.categories.find((c) => c.slug === p.categorySlug)?.name ?? "";
      const sub = store.categories.find((c) => c.slug === p.subcategorySlug)?.name ?? "";
      if (!matches(query.q, `${p.title} ${p.summary} ${p.material} ${p.colour} ${cat} ${sub}`)) return false;
    }
    return true;
  });
  if (query.newArrivals) list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (query.slugs) list = query.slugs.map((s) => list.find((p) => p.slug === s)).filter((p) => p !== undefined);
  return (query.limit ? list.slice(0, query.limit) : list).map(publicView);
}

const nextNumber = () => `CS${1001 + orders.size}`;
const newId = () => `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const seedRepo: Repo = {
  kind: "seed",
  async listCategories() {
    return visibleCategories();
  },
  async getCategory(slug) {
    return visibleCategories().find((c) => c.slug === slug) ?? null;
  },
  async listProducts(query) {
    return applyQuery(query);
  },
  async getProductBySlug(slug) {
    const p = active().find((x) => x.slug === slug);
    return p ? publicView(p) : null;
  },
  async listReviews(productId) {
    return approvedReviews().filter((r) => r.productId === productId);
  },
  async listPosts() {
    return publishedPosts().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  async getPost(slug) {
    return publishedPosts().find((p) => p.slug === slug) ?? null;
  },
  async createOrder({ address, items, delivery, userId }) {
    const merged = new Map<string, number>();
    for (const i of items) merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.quantity);
    const lines: OrderItem[] = [...merged].map(([productId, quantity]) => {
      const p = active().find((x) => x.id === productId);
      if (!p) throw new OrderError("A product in your cart is no longer available");
      if (quantity > 10) throw new OrderError(`Quantity for ${p.title} must be between 1 and 10`);
      if (p.stock < quantity) throw new OrderError(`${p.title} is out of stock`);
      return {
        productId: p.id,
        slug: p.slug,
        path: paths.product(p),
        title: p.title,
        image: p.images[0]?.src ?? "",
        quantity,
        unitPrice: p.price,
        unitMrp: p.mrp,
        meeshoPrice: p.meeshoPrice ?? 0,
        meeshoUrl: p.meeshoUrl ?? "",
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const shipping = shippingFor(subtotal, delivery);
    const now = new Date().toISOString();
    const order: Order = {
      id: newId(),
      number: nextNumber(),
      status: "pending_payment",
      address,
      items: lines,
      subtotal,
      shipping,
      discount: 0,
      total: subtotal + shipping,
      events: [{ status: "pending_payment", at: now, note: "Order created" }],
      createdAt: now,
      customerUserId: userId,
    };
    orders.set(order.id, order);
    return order;
  },
  async getOrder(id) {
    return orders.get(id) ?? null;
  },
  async findOrderByRazorpayOrderId(razorpayOrderId) {
    for (const o of orders.values()) if (o.razorpayOrderId === razorpayOrderId) return o;
    return null;
  },
  async findOrderForTracking(number, phone) {
    for (const o of orders.values()) {
      if (o.number.toUpperCase() === number.toUpperCase() && o.address.phone === phone) return o;
    }
    return null;
  },
  async listOrdersForUser(userId) {
    return [...orders.values()].filter((o) => o.customerUserId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async attachRazorpayOrder(orderId, razorpayOrderId) {
    const o = orders.get(orderId);
    if (o) orders.set(orderId, { ...o, razorpayOrderId });
  },
  async markOrderPaid(orderId, payment) {
    // Single-threaded JS: check-and-set below cannot interleave, mirroring the row lock in SQL.
    const o = orders.get(orderId);
    if (!o) throw new OrderError("Order not found");
    if (o.status !== "pending_payment") return { order: o, changed: false };
    if (payment.razorpayOrderId && o.razorpayOrderId !== payment.razorpayOrderId) throw new OrderError("Payment does not belong to this order");
    if (payment.amountPaise !== undefined && Math.round(o.total * 100) !== payment.amountPaise) {
      throw new OrderError(`Paid amount ${payment.amountPaise} does not match order total ${Math.round(o.total * 100)}`);
    }
    const at = new Date().toISOString();
    const updated: Order = {
      ...o,
      status: "paid",
      razorpayPaymentId: payment.razorpayPaymentId ?? o.razorpayPaymentId,
      events: [...o.events, { status: "paid", at, note: "Payment captured" }],
    };
    orders.set(orderId, updated);
    for (const i of o.items) {
      const p = store.products.find((x) => x.id === i.productId);
      if (p) p.stock = Math.max(0, p.stock - i.quantity);
    }
    return { order: updated, changed: true };
  },
  async updateOrderStatus(id, status, patch = {}, note) {
    const o = orders.get(id);
    if (!o) return null;
    // Like set_order_status (coalesce): fields left empty keep their previous value.
    const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as Partial<Order>;
    const updated: Order = { ...o, ...defined, status, events: [...o.events, { status, at: new Date().toISOString(), note }] };
    orders.set(id, updated);
    return updated;
  },
};
