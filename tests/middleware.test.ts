import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { exportJWK, generateKeyPair, SignJWT } from "jose";

const SHOP = "cityseller.in";
const ADMIN = "admin.cityseller.in";

async function load(env: Record<string, string> = {}) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ADMIN_HOST", ADMIN);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", `https://${SHOP}`);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("CF_ACCESS_TEAM_DOMAIN", "");
  vi.stubEnv("CF_ACCESS_AUD", "");
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return (await import("@/middleware")).middleware;
}

const req = (host: string, path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://${host}${path}`, { headers: { host, ...headers } });

const rewriteTarget = (res: Response) => res.headers.get("x-middleware-rewrite");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("shop website", () => {
  it("serves shop pages untouched and hides every /admin URL behind the normal 404", async () => {
    const mw = await load();
    const shop = await mw(req(SHOP, "/kitchen"));
    expect(rewriteTarget(shop)).toBeNull();
    for (const p of ["/admin", "/admin/orders", "/admin/login"]) {
      const res = await mw(req(SHOP, p));
      expect(new URL(rewriteTarget(res)!).pathname).toBe("/404");
    }
  });

  it("redirects www to the canonical host", async () => {
    const mw = await load();
    const res = await mw(req(`www.${SHOP}`, "/bestsellers?x=1"));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(`https://${SHOP}/bestsellers?x=1`);
  });
});

describe("admin website", () => {
  it("maps clean URLs onto the admin routes with no-index, no-cache, no-frame headers", async () => {
    const mw = await load();
    const home = await mw(req(ADMIN, "/"));
    expect(new URL(rewriteTarget(home)!).pathname).toBe("/admin");
    const orders = await mw(req(ADMIN, "/orders/abc"));
    expect(new URL(rewriteTarget(orders)!).pathname).toBe("/admin/orders/abc");
    expect(orders.headers.get("x-robots-tag")).toContain("noindex");
    expect(orders.headers.get("cache-control")).toContain("no-store");
    expect(orders.headers.get("x-frame-options")).toBe("DENY");
    expect(orders.headers.get("content-security-policy")).toBe("frame-ancestors 'none'");
  });

  it("redirects /admin/... to clean URLs, blocks shop APIs and disallows all crawling", async () => {
    const mw = await load();
    const r = await mw(req(ADMIN, "/admin/products"));
    expect(r.status).toBe(308);
    expect(new URL(r.headers.get("location")!).pathname).toBe("/products");
    expect((await mw(req(ADMIN, "/api/checkout"))).status).toBe(404);
    const robots = await mw(req(ADMIN, "/robots.txt"));
    expect(await robots.text()).toContain("Disallow: /");
  });

  it("requires a valid Cloudflare Access token when Access is configured", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RS256");
    const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "RS256", use: "sig" };
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ keys: [jwk] }), { headers: { "content-type": "application/json" } }));
    const mw = await load({ CF_ACCESS_TEAM_DOMAIN: "cityseller.cloudflareaccess.com", CF_ACCESS_AUD: "aud-123" });

    const sign = (aud: string) =>
      new SignJWT({ email: "partner@example.com" })
        .setProtectedHeader({ alg: "RS256", kid: "k1" })
        .setIssuer("https://cityseller.cloudflareaccess.com")
        .setAudience(aud)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(privateKey);

    expect((await mw(req(ADMIN, "/orders"))).status).toBe(403);
    expect((await mw(req(ADMIN, "/orders", { "cf-access-jwt-assertion": "not-a-jwt" }))).status).toBe(403);
    expect((await mw(req(ADMIN, "/orders", { "cf-access-jwt-assertion": await sign("other-app") }))).status).toBe(403);
    const ok = await mw(req(ADMIN, "/orders", { "cf-access-jwt-assertion": await sign("aud-123") }));
    expect(ok.status).toBe(200);
    expect(new URL(rewriteTarget(ok)!).pathname).toBe("/admin/orders");
  });
});

describe("local development (no admin host)", () => {
  it("keeps the admin under /admin on the same host", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_ADMIN_HOST", "");
    const { middleware } = await import("@/middleware");
    const res = await middleware(req("localhost", "/admin/orders"));
    expect(rewriteTarget(res)).toBeNull();
    expect(res.status).toBe(200);
  });
});
