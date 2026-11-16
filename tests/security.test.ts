import { describe, expect, it } from "vitest";
import { hasPermission } from "@admin/lib/auth/permissions";
import { isLocked, MAX_FAILURES, recordAttempt } from "@/lib/auth/rate-limit";
import { defaultFor, orderHeroSlides, schemaFor, settingsSchema, type HomeContent } from "@/lib/content/schema";
import { safeNext } from "@shop/lib/customer";
import { whatsappHref } from "@/lib/utils/contact";
import { newCode } from "@admin/lib/auth/email-code";
import { testHero } from "./fixtures/hero";

describe("admin roles", () => {
  it("Super Admins can do everything; Admins only what they were given", () => {
    expect(hasPermission({ role: "super_admin", permissions: [] }, "settings")).toBe(true);
    expect(hasPermission({ role: "admin", permissions: ["orders"] }, "orders")).toBe(true);
    expect(hasPermission({ role: "admin", permissions: ["orders"] }, "settings")).toBe(false);
    expect(hasPermission({ role: "admin", permissions: [] }, "products")).toBe(false);
  });
});

describe("sign-in rate limiting (mock mode)", () => {
  it(`locks an account after ${MAX_FAILURES} failures and does not affect other accounts`, async () => {
    const key = `admin:locktest-${Date.now()}@example.com`;
    for (let i = 0; i < MAX_FAILURES - 1; i++) await recordAttempt(key, "ip-a", false);
    expect(await isLocked(key, "ip-a")).toBe(false);
    await recordAttempt(key, "ip-a", false);
    expect(await isLocked(key, "ip-a")).toBe(true);
    expect(await isLocked(`admin:other-${Date.now()}@example.com`, "ip-b")).toBe(false);
    // The lock window expires.
    expect(await isLocked(key, "ip-a", Date.now() + 16 * 60_000)).toBe(false);
  });
});

describe("customer sign-in redirects", () => {
  it("only allows same-site relative paths", () => {
    expect(safeNext("/checkout")).toBe("/checkout");
    expect(safeNext("//evil.example")).toBe("/account");
    expect(safeNext("https://evil.example")).toBe("/account");
    expect(safeNext("/\\evil.example")).toBe("/account");
    expect(safeNext(undefined)).toBe("/account");
  });
});

describe("hero slide options", () => {
  const hero = testHero();
  const withSlide = (patch: object) => ({ sections: [{ ...hero, slides: [{ ...hero.slides[0]!, ...patch }] }] });

  it("requires a destination when a slide is clickable, and accepts category paths", () => {
    expect(schemaFor("home").safeParse(withSlide({ clickable: true, link: "" })).success).toBe(false);
    expect(schemaFor("home").safeParse(withSlide({ clickable: true, link: "/kitchen/cookware" })).success).toBe(true);
    expect(schemaFor("home").safeParse(withSlide({ clickable: true, link: "javascript:alert(1)" })).success).toBe(false);
    expect(schemaFor("home").safeParse(withSlide({ enabled: false })).success).toBe(true);
  });

  it("needs only an image and description; button and text fields are optional", () => {
    const bare = { title: "", text: "", primaryCta: { label: "", href: "" }, secondaryCta: null };
    expect(schemaFor("home").safeParse(withSlide({ ...bare, clickable: true, link: "/kitchen" })).success).toBe(true);
    expect(schemaFor("home").safeParse(withSlide({ ...bare, image: { src: hero.slides[0]!.image.src, alt: "" } })).success).toBe(false);
  });

  it("puts an offer slide first and defaults older slides to category slides", () => {
    const s = (id: string, slideType: "category" | "offer") => ({ id, slideType });
    expect(orderHeroSlides([s("a", "category"), s("b", "category"), s("o", "offer")]).map((x) => x.id)).toEqual(["o", "a", "b"]);
    const { slideType: _omit, ...legacy } = hero.slides[0]!;
    const parsed = schemaFor("home").parse({ sections: [{ ...hero, slides: [legacy] }] }) as HomeContent;
    expect(parsed.sections[0]!.type === "hero" && parsed.sections[0]!.slides[0]!.slideType).toBe("category");
  });
});

describe("WhatsApp button", () => {
  it("is on by default with the placeholder number, and builds a wa.me link", () => {
    const s = settingsSchema.parse(defaultFor("settings"));
    expect(s.whatsappButton.enabled).toBe(true);
    expect(s.care.whatsapp).toBe("919000000000");
    expect(whatsappHref(s.care.whatsapp, "Hi")).toBe("https://wa.me/919000000000?text=Hi");
  });
});

describe("admin email sign-in code", () => {
  it("is always 6 digits and not predictable", () => {
    const codes = Array.from({ length: 200 }, newCode);
    for (const c of codes) expect(c).toMatch(/^\d{6}$/);
    expect(new Set(codes).size).toBeGreaterThan(190);
  });
});

describe("picture links", () => {
  it("accepts uploads, site paths and Meesho images; rejects other websites", async () => {
    const { isAllowedImageSrc } = await import("@/lib/content/schema");
    expect(isAllowedImageSrc("https://abc.supabase.co/storage/v1/object/public/x.webp")).toBe(true);
    expect(isAllowedImageSrc("https://images.meesho.com/images/products/1/a_512.avif?width=512")).toBe(true);
    expect(isAllowedImageSrc("/logo/mark.png")).toBe(true);
    expect(isAllowedImageSrc("https://example.com/a.jpg")).toBe(false);
    expect(isAllowedImageSrc("http://images.meesho.com/a.jpg")).toBe(false);
    expect(isAllowedImageSrc("//images.meesho.com/a.jpg")).toBe(false);
  });
});
