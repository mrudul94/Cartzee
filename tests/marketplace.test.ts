import { describe, expect, it } from "vitest";
import { heroSlideSchema, homeSchema, sectionSchema, DEFAULT_HOME } from "@/lib/content/schema";
import { addMarketplaceSections, duplicateSection, missingMarketplaceSections, newHeroSlide, newSection } from "@/lib/content/new-section";
import { recommendProducts } from "@/lib/recommend";
import { hms, msUntilMidnightIST } from "@/lib/utils/deals";
import { byTrending } from "@/lib/utils/product";
import { topCategories } from "@/hooks/useRecentlyViewed";
import type { ProductQuery } from "@/lib/data/repo";
import type { Product } from "@/lib/types";
import { asRole, createTestDb } from "./db-harness";
import { testProducts } from "./fixtures/catalogue";

const p = (slug: string, category: string, extra: Partial<Product> = {}): Product =>
  ({ ...testProducts[0]!, id: slug, slug, categorySlug: category, isBestseller: false, boughtCount: 0, rating: 0, reviewCount: 0, createdAt: "2026-01-01", ...extra }) as Product;

describe("trending sort", () => {
  it("most bought first, then rating (only with reviews), then newest", () => {
    const list = [
      p("old", "k", { createdAt: "2026-01-01" }),
      p("rated", "k", { rating: 4.8, reviewCount: 3 }),
      p("unreviewed-5", "k", { rating: 5, reviewCount: 0, createdAt: "2026-02-01" }),
      p("popular", "k", { boughtCount: 40 }),
    ];
    expect([...list].sort(byTrending).map((x) => x.slug)).toEqual(["popular", "rated", "unreviewed-5", "old"]);
  });
});

describe("deals countdown (midnight IST)", () => {
  it("counts down to 00:00 India time", () => {
    // 18:30 UTC = 00:00 IST, so 18:00 UTC is 30 minutes before midnight in India.
    expect(msUntilMidnightIST(new Date("2026-11-20T18:00:00Z"))).toBe(30 * 60_000);
    expect(msUntilMidnightIST(new Date("2026-11-20T18:30:00Z"))).toBe(86_400_000);
    expect(hms(3_725_000)).toEqual(["01", "02", "05"]);
    expect(hms(-5)).toEqual(["00", "00", "00"]);
  });
});

describe("recommendations", () => {
  const catalogue = [
    p("k1", "kitchen", { boughtCount: 5 }),
    p("k2", "kitchen", { isBestseller: true }),
    p("k3", "kitchen"),
    p("b1", "bathroom", { boughtCount: 9 }),
    p("d1", "decor", { boughtCount: 50 }),
  ];
  const repo = {
    async listProducts(q: ProductQuery) {
      const list = catalogue.filter((x) => !q.category || x.categorySlug === q.category);
      return q.sort === "trending" ? [...list].sort(byTrending) : list;
    },
  };

  it("takes the viewed categories first (bestsellers lead), skips seen products, tops up with trending", async () => {
    const out = await recommendProducts(repo, { categories: ["kitchen", "bathroom"], exclude: ["k1"], limit: 4 });
    expect(out.map((x) => x.slug)).toEqual(["k2", "b1", "k3", "d1"]);
  });

  it("is plain trending for first-time visitors", async () => {
    const out = await recommendProducts(repo, { categories: [], exclude: [], limit: 2 });
    expect(out.map((x) => x.slug)).toEqual(["d1", "b1"]);
  });

  it("most viewed categories lead", () => {
    expect(topCategories([{ slug: "a", category: "decor" }, { slug: "b", category: "kitchen" }, { slug: "c", category: "kitchen" }])).toEqual(["kitchen", "decor"]);
  });
});

describe("homepage sections", () => {
  it("default homepage is valid and has deals, recommended, trending and recently viewed", () => {
    const home = homeSchema.parse(DEFAULT_HOME);
    const ids = home.sections.map((s) => s.id);
    expect(ids.slice(0, 4)).toEqual(["categories", "deals", "recommended", "trending"]);
    expect(ids).toContain("recently-viewed");
    expect(home.sections.find((s) => s.id === "deals")).toMatchObject({ type: "productRow", source: "flashSale", countdown: true });
  });

  it("new section types can be added from the admin", () => {
    for (const t of ["recommended", "recentlyViewed"] as const) expect(sectionSchema.safeParse(newSection(t)).success).toBe(true);
    // Older saved product rows (no countdown field) still load.
    const { countdown: _, ...old } = newSection("productRow") as Record<string, unknown>;
    expect(sectionSchema.parse(old)).toMatchObject({ countdown: false });
  });
});

describe("one-click marketplace sections (Admin → Homepage)", () => {
  it("adds deals, recommended and trending after the category circles and recently viewed before the info sections", () => {
    const saved = [newSection("hero"), newSection("categoryTiles"), newSection("productRow"), newSection("valueProps"), newSection("faq")];
    const out = addMarketplaceSections(saved);
    expect(out.map((s) => s.type)).toEqual(["hero", "categoryTiles", "productRow", "recommended", "productRow", "categoryTiles", "productRow", "recentlyViewed", "valueProps", "faq"]);
    expect(missingMarketplaceSections(out)).toEqual([]);
    expect(addMarketplaceSections(out)).toEqual(out); // nothing added twice
    expect(new Set(out.map((s) => s.id)).size).toBe(out.length);
  });
});

describe("copy a section / big slider style", () => {
  it("a copy gets fresh ids, including slides and banners, and stays valid", () => {
    for (const t of ["hero", "offerBanner", "bannerGrid", "categoryTiles"] as const) {
      const a = newSection(t);
      const b = duplicateSection(a);
      expect(b.id).not.toBe(a.id);
      // Every id (section, slides, banners) in the copy is new.
      const ids = (x: unknown) => JSON.stringify(x).match(/"id":"[^"]+"/g) ?? [];
      for (const id of ids(b)) expect(ids(a)).not.toContain(id);
    }
    const tiles = newSection("categoryTiles");
    expect(homeSchema.safeParse({ sections: [tiles, duplicateSection(tiles)], categoryRowsManaged: true }).success).toBe(true);
    const hero = newSection("hero");
    const heroCopy = duplicateSection(hero);
    if (hero.type === "hero" && heroCopy.type === "hero") expect(heroCopy.slides[0]!.id).not.toBe(hero.slides[0]!.id);
  });

  it("category tiles accept the big slider style", () => {
    expect(sectionSchema.safeParse({ ...newSection("categoryTiles"), variant: "slider" }).success).toBe(true);
  });
});

describe("hero text slides", () => {
  const slide = { ...newHeroSlide(), image: { src: "/hero.jpg", alt: "Women ethnic wear" }, eyebrow: "Shop women ethnic wear", title: "Buy Women Ethnic Wear", primaryCta: { label: "Shop now", href: "/fashion" } };
  it("new slides use the photo + text + button design", () => {
    expect(newHeroSlide().style).toBe("text");
    expect(heroSlideSchema.safeParse(slide).success).toBe(true);
  });
  it("needs a title, and a link when the button has text", () => {
    expect(heroSlideSchema.safeParse({ ...slide, title: "" }).success).toBe(false);
    expect(heroSlideSchema.safeParse({ ...slide, primaryCta: { label: "Shop now", href: "" } }).success).toBe(false);
    expect(heroSlideSchema.safeParse({ ...slide, primaryCta: { label: "", href: "" } }).success).toBe(true);
  });
  it("older saved slides stay finished artwork", () => {
    const { style: _, ...old } = slide;
    expect(heroSlideSchema.parse(old).style).toBe("artwork");
  });
});

describe("demo products (migration 0013)", () => {
  it("can't be ordered; normal products still can", async () => {
    const db = await createTestDb();
    const customer = { name: "Test Buyer", phone: "9876543210", email: "buyer@example.com" };
    const address = { ...customer, line1: "12 MG Road", city: "Pune", state: "Maharashtra", pincode: "411001" };
    const [demo, real] = (await db.query<{ id: string }>("select id from products where stock > 0 and coalesce(array_length(sizes, 1), 0) = 0 order by slug limit 2")).rows;
    await db.query("update products set is_demo = true where id = $1", [demo!.id]);
    const order = (items: unknown) =>
      asRole(db, "service_role", () => db.query("select public.create_order($1, $2, $3, 499, 49) as id", [customer, address, JSON.stringify(items)]));
    await expect(order([{ product_id: demo!.id, quantity: 1 }])).rejects.toThrow(/sample product/);
    await expect(order([{ product_id: real!.id, quantity: 1 }])).resolves.toBeTruthy();
  }, 60_000);
});
