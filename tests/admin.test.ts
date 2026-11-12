import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { faqsToText, orderUpdateSchema, productFormSchema, specsToText, textToFaqs, textToSpecs } from "@/lib/admin/forms";
import { whatsappMessage } from "@/lib/admin/whatsapp";
import { adminTransitions } from "@/lib/orders/status";
import { seedProducts } from "@/lib/seed/products";

// Server actions call revalidatePath/redirect, which need a Next request context.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
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
  images: JSON.stringify([{ src: "/placeholders/products/airtight-jar-set-6pc-1.svg", alt: "Bamboo cutlery holder front view" }]),
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
    const { updateOrderAction } = await import("@/app/admin/actions");
    const order = await repo.createOrder({
      address: { name: "Asha Rao", phone: "9876501234", email: "asha@example.com", line1: "4 Lake View Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
      items: [{ productId: seedProducts[0]!.id, quantity: 1 }],
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
