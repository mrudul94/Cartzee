import { describe, expect, it } from "vitest";
import { hasPermission } from "@admin/lib/auth/permissions";
import { isLocked, MAX_FAILURES, recordAttempt } from "@/lib/auth/rate-limit";
import { defaultFor, orderHeroSlides, schemaFor, settingsSchema, type HomeContent } from "@/lib/content/schema";
import { safeNext } from "@shop/lib/customer";
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

  it("artwork slides need only an image and description; button and text fields are optional", () => {
    const bare = { style: "artwork", title: "", text: "", primaryCta: { label: "", href: "" }, secondaryCta: null };
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

describe("WhatsApp", () => {
  it("is off on the shop, and older saved settings with the button still load", () => {
    const s = settingsSchema.parse(defaultFor("settings"));
    expect(s.whatsappButton.enabled).toBe(false);
    const legacy = settingsSchema.parse({ ...(defaultFor("settings") as object), whatsappButton: { enabled: true, message: "Hi" } });
    expect(legacy.whatsappButton.message).toBe("Hi");
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

describe("account forms", () => {
  it("validates saved addresses and profile details", async () => {
    const { savedAddressSchema, profileSchema } = await import("@/lib/account");
    const ok = { name: "Asha Rao", phone: "+91 98765 43210", line1: "4 Lake View Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", isDefault: "on" };
    const parsed = savedAddressSchema.parse(ok);
    expect(parsed.phone).toBe("9876543210");
    expect(parsed.isDefault).toBe(true);
    expect(savedAddressSchema.parse({ ...ok, isDefault: undefined }).isDefault).toBe(false);
    expect(savedAddressSchema.safeParse({ ...ok, pincode: "012345" }).success).toBe(false);
    expect(savedAddressSchema.safeParse({ ...ok, state: "Atlantis" }).success).toBe(false);
    expect(savedAddressSchema.safeParse({ ...ok, id: "not-a-uuid" }).success).toBe(false);
    expect(profileSchema.parse({ name: "Asha", phone: "" }).phone).toBe("");
    expect(profileSchema.safeParse({ name: "Asha", phone: "12345" }).success).toBe(false);
  });
});

describe("admin email code pause switch (testing only)", () => {
  it("is on unless ADMIN_EMAIL_CODE=off", async () => {
    const { emailCodePaused } = await import("@admin/lib/auth/email-code");
    const before = process.env.ADMIN_EMAIL_CODE;
    delete process.env.ADMIN_EMAIL_CODE;
    expect(emailCodePaused()).toBe(false);
    process.env.ADMIN_EMAIL_CODE = "on";
    expect(emailCodePaused()).toBe(false);
    process.env.ADMIN_EMAIL_CODE = " OFF ";
    expect(emailCodePaused()).toBe(true);
    if (before === undefined) delete process.env.ADMIN_EMAIL_CODE;
    else process.env.ADMIN_EMAIL_CODE = before;
  });
});
