import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { faqsToText, orderUpdateSchema, productFormSchema, specsToText, textToFaqs, textToSpecs } from "@/lib/admin/forms";
import { whatsappMessage } from "@/lib/admin/whatsapp";
import { adminTransitions } from "@/lib/orders/status";
import { testProducts as seedProducts } from "./fixtures/catalogue";

// Server actions call revalidatePath/redirect, which need a Next request context.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url });
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const validProduct = {
  title: "Bamboo Cutlery Holder with Drainer",
  slug: "",
  categorySlug: "kitchen",
  subcategorySlug: "kitchen-tools",
  summary: "A bamboo cutlery stand with a drip tray, for drying spoons and forks on the counter.",
  description: "Natural bamboo with three compartments and a removable drip tray that keeps the counter dry.",
  howToUse: "Rinse before use\nEmpty the tray daily",
  specs: "Material: Bamboo\nSize: 12 x 12 x 15 cm",
  faqs: "Q: Is it waterproof?\nA: It is lacquered; wipe dry weekly.\n\nQ: Does it fit knives?\nA: Yes, up to 22 cm.",
  material: "Bamboo",
  colour: "Natural",
  price: "349",
  mrp: "699",
  meeshoUrl: "https://www.meesho.com/example",
  meeshoPrice: "190",
  priceChecked: "on",
  stock: "25",
  isActive: "on",
  images: JSON.stringify([{ src: "/logo/mark.png", alt: "Bamboo cutlery holder front view" }]),
};

describe("product form parsing", () => {
  it("round-trips specs and FAQs text", () => {
    const specs = [{ label: "Capacity", value: "1.2 L" }, { label: "Material", value: "PET: food grade" }];
    expect(textToSpecs(specsToText(specs))).toEqual(specs);
    const faqs = [{ q: "Is it safe?", a: "Yes." }, { q: "Size?", a: "Two lines\nof answer." }];
    expect(textToFaqs(faqsToText(faqs))).toEqual(faqs);
  });

  it("parses a valid product and derives the slug", () => {
    const r = productFormSchema.safeParse(validProduct);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.slug).toBe("bamboo-cutlery-holder-with-drainer");
    expect(r.data.price).toBe(349);
    expect(r.data.priceChecked).toBe(true);
    expect(r.data.isBestseller).toBe(false);
    expect(r.data.countryOfOrigin).toBe("");
    expect(r.data.qualityCertified).toBe(false);
    expect(r.data.specs).toHaveLength(2);
    expect(r.data.faqs).toHaveLength(2);
  });

  it("rejects MRP below price, missing images and missing alt text", () => {
    const bad = productFormSchema.safeParse({ ...validProduct, mrp: "100", images: "[]" });
    expect(bad.success).toBe(false);
    const paths = bad.success ? [] : bad.error.issues.map((i) => i.path[0]);
    expect(paths).toContain("mrp");
    expect(paths).toContain("images");
    const noAlt = productFormSchema.safeParse({ ...validProduct, images: JSON.stringify([{ src: "/x.svg", alt: "" }]) });
    expect(noAlt.success).toBe(false);
  });
});

describe("product FAQs field", () => {
  it("saves the question/answer list, drops empty rows, and refuses half-filled ones", () => {
    const faqs = JSON.stringify([{ q: "Is it dishwasher safe?", a: "Yes, top rack." }, { q: "", a: "" }]);
    expect(productFormSchema.parse({ ...validProduct, faqs }).faqs).toEqual([{ q: "Is it dishwasher safe?", a: "Yes, top rack." }]);
    const half = productFormSchema.safeParse({ ...validProduct, faqs: JSON.stringify([{ q: "Size?", a: "" }]) });
    expect(half.success).toBe(false);
    // Older text format still works.
    expect(productFormSchema.parse({ ...validProduct, faqs: "Q: Colour?\nA: Blue." }).faqs).toEqual([{ q: "Colour?", a: "Blue." }]);
  });
});

describe("product sizes field", () => {
  it("splits, trims and de-duplicates sizes; empty means no sizes", () => {
    expect(productFormSchema.parse({ ...validProduct, sizes: "S, M ,L, M, " }).sizes).toEqual(["S", "M", "L"]);
    expect(productFormSchema.parse(validProduct).sizes).toEqual([]);
    expect(productFormSchema.safeParse({ ...validProduct, sizes: "x".repeat(25) }).success).toBe(false);
  });
});

describe("clothing categories need sizes", () => {
  it("refuses a clothing product without sizes, accepts it with sizes; other products are unaffected", async () => {
    const { adminRepo, AdminError } = await import("@/lib/data/admin-repo");
    const { store } = await import("@/lib/data/seed-store");
    const kitchen = store.categories.find((c) => c.slug === "kitchen")!;
    kitchen.hasSizes = true;
    try {
      const base = productFormSchema.parse({ ...validProduct, title: "Kids cotton apron", slug: "kids-cotton-apron" });
      await expect(adminRepo.saveProduct({ ...base, sizes: [] })).rejects.toBeInstanceOf(AdminError);
      await expect(adminRepo.saveProduct({ ...base, sizes: [] })).rejects.toThrow(/add at least one size/);
      const saved = await adminRepo.saveProduct({ ...base, sizes: ["2-3Y", "4-5Y"] });
      expect((await adminRepo.getProduct(saved.id))?.sizes).toEqual(["2-3Y", "4-5Y"]);
    } finally {
      kitchen.hasSizes = false;
    }
    const plain = await adminRepo.saveProduct(productFormSchema.parse({ ...validProduct, title: "Plain steel ladle", slug: "plain-steel-ladle" }));
    expect((await adminRepo.getProduct(plain.id))?.sizes ?? []).toEqual([]);
  });
});

describe("order update rules", () => {
  it("requires Meesho details to mark placed and a tracking link to mark shipped", () => {
    expect(orderUpdateSchema.safeParse({ orderId: "o", to: "placed_on_meesho" }).success).toBe(false);
    expect(orderUpdateSchema.safeParse({ orderId: "o", to: "placed_on_meesho", meeshoOrderId: "M123", meeshoCost: "260" }).success).toBe(true);
    expect(orderUpdateSchema.safeParse({ orderId: "o", to: "shipped" }).success).toBe(false);
    expect(orderUpdateSchema.safeParse({ orderId: "o", to: "shipped", trackingUrl: "https://track.example/1" }).success).toBe(true);
  });
  it("never offers 'paid' as a manual admin action", () => {
    expect(adminTransitions("pending_payment")).toEqual(["cancelled_refunded"]);
    expect(adminTransitions("paid")).toEqual(["placed_on_meesho", "cancelled_refunded"]);
  });
});

describe("admin repo + actions (mock mode)", () => {
  let logs: string[];
  beforeEach(() => {
    logs = [];
    vi.spyOn(console, "info").mockImplementation((...a) => void logs.push(a.join(" ")));
  });
  afterEach(() => vi.restoreAllMocks());

  it("creates a product that appears in the storefront, and hides it when inactive", async () => {
    const { adminRepo } = await import("@/lib/data/admin-repo");
    const { repo } = await import("@/lib/data");
    const parsed = productFormSchema.parse(validProduct);
    const saved = await adminRepo.saveProduct(parsed);
    expect((await repo.getProductBySlug(saved.slug))?.title).toBe(validProduct.title);
    expect((await repo.listProducts({ subcategory: "kitchen-tools" })).some((p) => p.id === saved.id)).toBe(true);

    await adminRepo.saveProduct({ ...parsed, id: saved.id, isActive: false });
    expect(await repo.getProductBySlug(saved.slug)).toBeNull();
    expect((await adminRepo.getProduct(saved.id))?.isActive).toBe(false);
  });

  it("rejects duplicate slugs and mismatched subcategories", async () => {
    const { adminRepo, AdminError } = await import("@/lib/data/admin-repo");
    const parsed = productFormSchema.parse({ ...validProduct, slug: seedProducts[1]!.slug });
    await expect(adminRepo.saveProduct(parsed)).rejects.toBeInstanceOf(AdminError);
    const wrongSub = productFormSchema.parse({ ...validProduct, title: "Another unique product title", subcategorySlug: "mops-brooms" });
    await expect(adminRepo.saveProduct(wrongSub)).rejects.toThrow(/Subcategory/);
  });

  it("removes a product that was never ordered, and refuses one that is in an order", async () => {
    const { adminRepo } = await import("@/lib/data/admin-repo");
    const { repo } = await import("@/lib/data");
    const { deleteProductAction } = await import("@admin/app/actions");
    const fd = (id: string) => {
      const f = new FormData();
      f.set("id", id);
      return f;
    };
    const saved = await adminRepo.saveProduct(productFormSchema.parse({ ...validProduct, title: "Product made to be removed", slug: "made-to-be-removed" }));
    await expect(deleteProductAction({}, fd(saved.id))).rejects.toMatchObject({ url: "/products?deleted=1" });
    expect(await adminRepo.getProduct(saved.id)).toBeNull();
    expect(await repo.getProductBySlug("made-to-be-removed")).toBeNull();

    const ordered = seedProducts[2]!;
    await repo.createOrder({
      address: { name: "Ravi K", phone: "9876501111", email: "ravi@example.com", line1: "1 Hill Road", city: "Pune", state: "Maharashtra", pincode: "411001" },
      items: [{ productId: ordered.id, quantity: 1 }],
      delivery: { freeAbove: 499, fee: 49 },
    });
    expect(await adminRepo.productOrderCount(ordered.id)).toBeGreaterThan(0);
    expect((await deleteProductAction({}, fd(ordered.id))).message).toMatch(/can't be deleted/);
    expect(await adminRepo.getProduct(ordered.id)).not.toBeNull();
    expect((await deleteProductAction({}, fd("no-such-product"))).message).toMatch(/not found/);

    // Same rules from the product list's quick "Remove" button.
    const { productQuickAction } = await import("@admin/app/cms-actions");
    const quick = (id: string) => {
      const f = fd(id);
      f.set("op", "delete");
      return f;
    };
    await expect(productQuickAction(quick(ordered.id))).rejects.toMatchObject({ url: "/products?notice=in-orders" });
    const spare = await adminRepo.saveProduct(productFormSchema.parse({ ...validProduct, title: "Removed from the list", slug: "removed-from-list" }));
    expect((await adminRepo.orderCountsByProduct()).get(ordered.id)).toBeGreaterThan(0);
    await expect(productQuickAction(quick(spare.id))).rejects.toMatchObject({ url: "/products?deleted=1" });
    expect(await adminRepo.getProduct(spare.id)).toBeNull();
  });

  it("saves a product without a subcategory at /<category>/<product>, and refuses a URL that clashes with a subcategory", async () => {
    const { adminRepo, AdminError } = await import("@/lib/data/admin-repo");
    const { repo } = await import("@/lib/data");
    const { paths } = await import("@/lib/utils/paths");
    const noSub = await adminRepo.saveProduct(productFormSchema.parse({ ...validProduct, title: "Product with no subcategory", slug: "no-sub-product", subcategorySlug: "" }));
    const shown = await repo.getProductBySlug("no-sub-product");
    expect(shown?.subcategorySlug).toBe("");
    expect(paths.product(shown!)).toBe("/kitchen/no-sub-product");
    expect((await repo.listProducts({ category: "kitchen" })).some((p) => p.id === noSub.id)).toBe(true);
    const clash = productFormSchema.parse({ ...validProduct, title: "Clashing product", slug: "kitchen-tools", subcategorySlug: "" });
    await expect(adminRepo.saveProduct(clash)).rejects.toBeInstanceOf(AdminError);
  });

  it("marks a Meesho price as checked", async () => {
    const { adminRepo } = await import("@/lib/data/admin-repo");
    const id = seedProducts.find((p) => p.slug === "door-draft-stopper-90cm")!.id;
    await adminRepo.markPriceChecked(id);
    const p = await adminRepo.getProduct(id);
    expect(Date.now() - new Date(p!.priceCheckedAt).getTime()).toBeLessThan(5000);
  });

  it("moves an order through fulfilment with validation, events and customer emails", async () => {
    const { repo } = await import("@/lib/data");
    const { markOrderPaid } = await import("@/lib/orders/service");
    const { updateOrderAction } = await import("@admin/app/actions");
    const order = await repo.createOrder({
      address: { name: "Asha Rao", phone: "9876501234", email: "asha@example.com", line1: "4 Lake View Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
      items: [{ productId: seedProducts[0]!.id, quantity: 1 }],
      delivery: { freeAbove: 499, fee: 49 },
    });
    const fd = (o: Record<string, string>) => {
      const f = new FormData();
      Object.entries({ orderId: order.id, ...o }).forEach(([k, v]) => f.set(k, v));
      return f;
    };

    expect((await updateOrderAction({}, fd({ to: "paid" }))).message).toMatch(/can't move/);
    // Unpaid orders can't be placed on Meesho even with valid details.
    expect((await updateOrderAction({}, fd({ to: "placed_on_meesho", meeshoOrderId: "MS-1", meeshoCost: "200" }))).message).toMatch(/can't move/);

    await markOrderPaid(order.id, { razorpayPaymentId: "pay_mock_1" });
    const missing = await updateOrderAction({}, fd({ to: "placed_on_meesho" }));
    expect(missing.errors?.meeshoOrderId).toBeDefined();

    expect((await updateOrderAction({}, fd({ to: "placed_on_meesho", meeshoOrderId: "MS-998877", meeshoCost: "255" }))).ok).toBe(true);
    expect((await updateOrderAction({}, fd({ to: "shipped", trackingUrl: "https://track.example/AWB123" }))).ok).toBe(true);

    const shipped = await repo.getOrder(order.id);
    expect(shipped?.status).toBe("shipped");
    expect(shipped?.meeshoOrderId).toBe("MS-998877");
    expect(shipped?.meeshoCost).toBe(255);
    expect(shipped?.events.map((e) => e.status)).toEqual(["pending_payment", "paid", "placed_on_meesho", "shipped"]);
    expect(shipped?.events.at(-1)?.note).toMatch(/dev-admin@localhost/);
    expect(logs.some((l) => l.includes("[email:mock]") && l.includes(`Order ${order.number}: Shipped`))).toBe(true);
    expect(whatsappMessage(shipped!)).toContain("https://track.example/AWB123");

    expect((await updateOrderAction({}, fd({ to: "delivered" }))).ok).toBe(true);
    expect((await updateOrderAction({}, fd({ to: "return_requested" }))).ok).toBe(true);
    const refunded = await updateOrderAction({}, fd({ to: "returned_refunded", refund: "on" }));
    expect(refunded.ok).toBe(true);
    const final = await repo.getOrder(order.id);
    expect(final?.status).toBe("returned_refunded");
    expect(final?.events.at(-1)?.note).toMatch(/Refund simulated/);
  });
});
