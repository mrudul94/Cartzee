import { describe, expect, it } from "vitest";
import { hasPermission } from "@admin/lib/auth/permissions";
import { isLocked, MAX_FAILURES, recordAttempt } from "@/lib/auth/rate-limit";
import { defaultFor, schemaFor, settingsSchema, type HomeContent } from "@/lib/content/schema";
import { safeNext } from "@shop/lib/customer";
import { whatsappHref } from "@/lib/utils/contact";

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
  const home = defaultFor("home") as HomeContent;
  const hero = home.sections[0]!;
  if (hero.type !== "hero") throw new Error("hero first");
  const withSlide = (patch: object) => ({ sections: [{ ...hero, slides: [{ ...hero.slides[0]!, ...patch }] }] });

  it("requires a destination when a slide is clickable, and accepts category paths", () => {
    expect(schemaFor("home").safeParse(withSlide({ clickable: true, link: "" })).success).toBe(false);
    expect(schemaFor("home").safeParse(withSlide({ clickable: true, link: "/kitchen/cookware" })).success).toBe(true);
    expect(schemaFor("home").safeParse(withSlide({ clickable: true, link: "javascript:alert(1)" })).success).toBe(false);
    expect(schemaFor("home").safeParse(withSlide({ enabled: false })).success).toBe(true);
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
