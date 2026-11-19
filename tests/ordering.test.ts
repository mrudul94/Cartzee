import { describe, expect, it } from "vitest";
import { productFormSchema } from "@/lib/admin/forms";
import { categoryRowSection, insertBeforeInfo, newSection } from "@/lib/content/new-section";
import { homeSchema } from "@/lib/content/schema";
import { byPosition } from "@/lib/utils/product";
import { asRole, createTestDb } from "./db-harness";

describe("product position (shop order)", () => {
  it("numbered products first (lowest first), then the rest newest first", () => {
    const list = [
      { id: "old", position: null, createdAt: "2026-01-01" },
      { id: "p2", position: 2, createdAt: "2026-01-02" },
      { id: "new", position: undefined, createdAt: "2026-03-01" },
      { id: "p1", position: 1, createdAt: "2025-12-01" },
    ];
    expect([...list].sort(byPosition).map((p) => p.id)).toEqual(["p1", "p2", "new", "old"]);
  });

  it("form: empty = automatic, whole numbers 1–9999 only", () => {
    const base = { title: "Test product", slug: "test-product", categorySlug: "kitchen", subcategorySlug: "", summary: "A useful thing for the home.", description: "Long enough description of the product for the form.", price: "199", mrp: "299", meeshoPrice: "120", stock: "5", images: JSON.stringify([{ src: "/x.svg", alt: "Photo" }]) };
    const parse = (position: string) => productFormSchema.safeParse({ ...base, position });
    expect(parse("").success, JSON.stringify(parse("").error?.issues)).toBe(true);
    expect(parse("").data?.position).toBeNull();
    expect(parse("3").data?.position).toBe(3);
    expect(parse("0").success).toBe(false);
    expect(parse("1.5").success).toBe(false);
    expect(parse("10000").success).toBe(false);
  });

  it("migration 0012: shoppers can read the position", async () => {
    const db = await createTestDb();
    await asRole(db, "service_role", () => db.query("update products set position = 1 where slug = (select slug from products limit 1)"));
    const rows = await asRole(db, "anon", () => db.query<{ position: number | null }>("select position from products where position is not null"));
    expect(rows.rows).toEqual([{ position: 1 }]);
  });
});

describe("homepage category rows", () => {
  it("a category row is a normal product row for that category", () => {
    const s = categoryRowSection({ slug: "storage-organisers", name: "Storage & Organisers", parentSlug: null });
    expect(s).toMatchObject({ type: "productRow", source: "category", categorySlug: "storage-organisers", title: "Storage & Organisers", limit: 7, layout: "row", viewAllHref: "/storage-organisers" });
    expect(homeSchema.safeParse({ sections: [s], categoryRowsManaged: true }).success).toBe(true);
  });

  it("rows go before the trust/info sections", () => {
    const rows = [categoryRowSection({ slug: "kitchen", name: "Kitchen", parentSlug: null })];
    const out = insertBeforeInfo([newSection("productRow"), newSection("valueProps"), newSection("faq")], rows);
    expect(out.map((s) => s.type)).toEqual(["productRow", "productRow", "valueProps", "faq"]);
    expect(out[1]!.id).toBe("cat-kitchen");
  });

  it("older saved homepages default to automatic category rows", () => {
    expect(homeSchema.parse({ sections: [] }).categoryRowsManaged).toBe(false);
  });
});
