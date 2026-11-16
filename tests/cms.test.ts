import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultFor,
  isScheduledLive,
  linkSchema,
  PAGE_SLUGS,
  scheduleState,
  schemaFor,
  type ContentKey,
  type HomeContent,
} from "@/lib/content/schema";
import { newSection } from "@/lib/content/new-section";
import { testHero } from "./fixtures/hero";
import { testProducts as seedProducts } from "./fixtures/catalogue";
import { isProductNew } from "@/lib/utils/product";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url });
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  Object.entries(o).forEach(([k, v]) => f.set(k, v));
  return f;
};

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("content schemas and defaults", () => {
  it("every built-in default is valid (the shop looks the same before anything is edited)", () => {
    const keys: ContentKey[] = ["settings", "home", "faqs", ...PAGE_SLUGS.map((s) => `page:${s}` as const)];
    for (const k of keys) expect(schemaFor(k).safeParse(defaultFor(k)).success, k).toBe(true);
  });

  it("every new section template is valid", () => {
    // A new hero slide has no picture yet, so it can't be saved until one is added.
    expect(schemaFor("home").safeParse({ sections: [newSection("hero")] }).success).toBe(false);
    expect(schemaFor("home").safeParse({ sections: [testHero()] }).success).toBe(true);
    const types = ["productRow", "offerBanner", "bannerGrid", "categoryTiles", "budgetTiles", "valueProps", "customerCare", "brandStory", "guides", "faq"] as const;
    for (const t of types) expect(schemaFor("home").safeParse({ sections: [newSection(t)] }).success, t).toBe(true);
  });

  it("only allows site paths and https links", () => {
    for (const ok of ["/kitchen", "/kitchen/storage-containers?x=1", "https://cityseller.in/x"]) expect(linkSchema.safeParse(ok).success, ok).toBe(true);
    for (const bad of ["javascript:alert(1)", "JAVASCRIPT:alert(1)", "//evil.example", "data:text/html,hi", "http://insecure.example", "kitchen", " javascript:x"])
      expect(linkSchema.safeParse(bad).success, bad).toBe(false);
  });

  it("rejects duplicate section ids", () => {
    const home = defaultFor("home") as HomeContent;
    const dup = { sections: [home.sections[0]!, home.sections[0]!] };
    expect(schemaFor("home").safeParse(dup).success).toBe(false);
  });
});

describe("scheduling (IST)", () => {
  const item = { startsAt: "2026-11-20T00:00:00+05:30", endsAt: "2026-11-23T00:00:00+05:30" };
  it("is live only between start and end", () => {
    expect(isScheduledLive(item, new Date("2026-11-19T18:29:59Z"))).toBe(false); // 23:59:59 IST on the 19th
    expect(isScheduledLive(item, new Date("2026-11-19T18:30:00Z"))).toBe(true); // midnight IST
    expect(isScheduledLive(item, new Date("2026-11-22T18:29:59Z"))).toBe(true);
    expect(isScheduledLive(item, new Date("2026-11-22T18:30:00Z"))).toBe(false);
    expect(isScheduledLive({ startsAt: "", endsAt: "" })).toBe(true);
  });
  it("reports scheduled / live / ended", () => {
    expect(scheduleState(item, new Date("2026-11-10T00:00:00Z"))).toBe("scheduled");
    expect(scheduleState(item, new Date("2026-11-21T00:00:00Z"))).toBe("live");
    expect(scheduleState(item, new Date("2026-12-01T00:00:00Z"))).toBe("ended");
  });
});

describe("New badge", () => {
  const now = new Date("2026-11-12T00:00:00Z");
  it("is automatic for 30 days, with manual on/off overrides", () => {
    expect(isProductNew({ createdAt: "2026-11-01T00:00:00Z" }, now)).toBe(true);
    expect(isProductNew({ createdAt: "2026-09-01T00:00:00Z" }, now)).toBe(false);
    expect(isProductNew({ createdAt: "2026-09-01T00:00:00Z", isNew: true }, now)).toBe(true);
    expect(isProductNew({ createdAt: "2026-11-01T00:00:00Z", isNew: false }, now)).toBe(false);
  });
});

describe("content repository (mock mode)", () => {
  it("saves valid content, keeps defaults for missing fields, and rejects unsafe links", async () => {
    const { getSettings, saveContent, ContentError, listActivity } = await import("@/lib/data/content-repo");
    const before = await getSettings();
    await saveContent("settings", { ...before, care: { ...before.care, phone: "+91 98765 43210" } }, "tester@example.com");
    expect((await getSettings()).care.phone).toBe("+91 98765 43210");
    expect((await listActivity(1))[0]).toMatchObject({ actor: "tester@example.com", target: "settings" });

    const hero = testHero();
    const evil = { sections: [{ ...hero, slides: [{ ...hero.slides[0]!, primaryCta: { label: "Go", href: "javascript:alert(1)" } }] }] };
    await expect(saveContent("home", evil, "tester@example.com")).rejects.toBeInstanceOf(ContentError);
  });
});

describe("delivery settings drive checkout", () => {
  it("charges the delivery fee configured in Settings", async () => {
    const { getSettings, saveContent } = await import("@/lib/data/content-repo");
    const s = await getSettings();
    await saveContent("settings", { ...s, delivery: { ...s.delivery, freeAbove: 999, fee: 79 } }, "tester@example.com");
    const { POST } = await import("@shop/app/api/checkout/route");
    const product = seedProducts[0]!; // ₹449
    const res = await POST(
      new Request("http://test/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: { name: "Test Buyer", phone: "9876543210", email: "b@example.com", line1: "12 MG Road, Flat 4B", city: "Pune", state: "Maharashtra", pincode: "411001" },
          items: [{ productId: product.id, quantity: 1 }],
        }),
      }),
    );
    expect(await res.json()).toMatchObject({ mode: "mock", amount: product.price + 79 });
    await saveContent("settings", s, "tester@example.com");
  });
});

describe("CMS actions (dev admin)", () => {
  it("saveContentAction validates and saves", async () => {
    const { saveContentAction } = await import("@admin/app/cms-actions");
    const { getStoreFaqs } = await import("@/lib/data/content-repo");
    const ok = await saveContentAction({}, fd({ key: "faqs", value: JSON.stringify({ items: [{ q: "Do you ship to Goa?", a: "Yes, all over India." }] }) }));
    expect(ok.ok).toBe(true);
    expect((await getStoreFaqs())[0]?.q).toBe("Do you ship to Goa?");
    expect((await saveContentAction({}, fd({ key: "faqs", value: JSON.stringify({ items: [] }) }))).ok).toBeFalsy();
    expect((await saveContentAction({}, fd({ key: "secrets", value: "{}" }))).message).toMatch(/Unknown/);
    expect((await saveContentAction({}, fd({ key: "faqs", value: "not json" }))).ok).toBeFalsy();
  });

  it("product quick actions: sold out, back in stock, hide, New badge, duplicate", async () => {
    const { productQuickAction } = await import("@admin/app/cms-actions");
    const { adminRepo } = await import("@/lib/data/admin-repo");
    const { repo } = await import("@/lib/data");
    const p = seedProducts[2]!;

    await productQuickAction(fd({ id: p.id, op: "soldout" }));
    expect((await adminRepo.getProduct(p.id))?.stock).toBe(0);
    await productQuickAction(fd({ id: p.id, op: "instock", restock: "15" }));
    expect((await adminRepo.getProduct(p.id))?.stock).toBe(15);

    await productQuickAction(fd({ id: p.id, op: "hide" }));
    expect(await repo.getProductBySlug(p.slug)).toBeNull();
    await productQuickAction(fd({ id: p.id, op: "show" }));
    expect(await repo.getProductBySlug(p.slug)).not.toBeNull();

    await productQuickAction(fd({ id: p.id, op: "new-on" }));
    expect((await repo.listProducts({ newArrivals: true })).some((x) => x.id === p.id)).toBe(true);
    await productQuickAction(fd({ id: p.id, op: "new-off" }));
    expect((await repo.listProducts({ newArrivals: true })).some((x) => x.id === p.id)).toBe(false);

    const err = await productQuickAction(fd({ id: p.id, op: "duplicate" })).catch((e: { url?: string }) => e);
    expect((err as { url?: string }).url).toMatch(/^\/products\/.+\?created=1/);
    const copy = (await adminRepo.listProducts()).find((x) => x.slug === `${p.slug}-copy`);
    expect(copy?.isActive).toBe(false);
  });

  it("refuses to delete a category that still has products, and approves reviews", async () => {
    const { deleteCategoryAction, reviewAction } = await import("@admin/app/cms-actions");
    const { contentAdmin } = await import("@/lib/data/admin-content");
    const kitchen = (await contentAdmin.listCategories()).find((c) => c.slug === "kitchen")!;
    const res = await deleteCategoryAction({}, fd({ id: kitchen.id }));
    expect(res.message).toMatch(/still has/);

    const review = (await contentAdmin.listReviews())[0]!;
    await reviewAction(fd({ id: review.id, op: "hide" }));
    expect((await contentAdmin.listReviews()).find((r) => r.id === review.id)?.isApproved).toBe(false);
    await reviewAction(fd({ id: review.id, op: "approve" }));
    expect((await contentAdmin.listReviews()).find((r) => r.id === review.id)?.isApproved).toBe(true);
  });

  it("creates a category and a guide that appear in the shop", async () => {
    const { saveCategoryAction, savePostAction } = await import("@admin/app/cms-actions");
    const { repo } = await import("@/lib/data");
    const cat = await saveCategoryAction(
      {},
      fd({ name: "Pooja Essentials", parentSlug: "home-decor", intro: "Brass diyas, incense holders and pooja thalis for daily prayers and festivals.", isActive: "on", faqs: "[]" }),
    ).catch((e: { url?: string }) => e);
    expect((cat as { url?: string }).url).toMatch(/^\/categories\//);
    expect((await repo.getCategory("pooja-essentials"))?.parentSlug).toBe("home-decor");

    const post = await savePostAction(
      {},
      fd({
        title: "How to organise a small kitchen",
        excerpt: "Five quick ways to free up counter space in a small Indian kitchen.",
        cover: "/logo/mark.png",
        isPublished: "on",
        body: JSON.stringify([{ type: "p", text: "Start with airtight jars." }, { type: "products", slugs: ["airtight-jar-set-6pc"] }]),
        faqs: "[]",
      }),
    ).catch((e: { url?: string }) => e);
    expect((post as { url?: string }).url).toMatch(/^\/guides\/how-to-organise-a-small-kitchen/);
    expect((await repo.getPost("how-to-organise-a-small-kitchen"))?.body).toHaveLength(2);
  });
});
