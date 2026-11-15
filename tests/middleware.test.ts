import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { exportJWK, generateKeyPair, SignJWT } from "jose";

const SHOP = "cityseller.in";
const ADMIN = "admin.cityseller.in";

const req = (host: string, path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://${host}${path}`, { headers: { host, ...headers } });

async function shopMiddleware() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", `https://${SHOP}`);
  return (await import("@shop/middleware")).middleware;
}

async function adminMiddleware(env: Record<string, string> = {}) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("CF_ACCESS_TEAM_DOMAIN", "");
  vi.stubEnv("CF_ACCESS_AUD", "");
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return (await import("@admin/middleware")).middleware;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("shop website", () => {
  it("serves pages untouched and redirects www to the canonical host", async () => {
    const mw = await shopMiddleware();
    const page = await mw(req(SHOP, "/kitchen"));
    expect(page.headers.get("location")).toBeNull();
    const www = await mw(req(`www.${SHOP}`, "/bestsellers?x=1"));
    expect(www.status).toBe(301);
    expect(www.headers.get("location")).toBe(`https://${SHOP}/bestsellers?x=1`);
  });
});

describe("admin website", () => {
  it("disallows all crawling", async () => {
    const mw = await adminMiddleware();
    const robots = await mw(req(ADMIN, "/robots.txt"));
    expect(await robots.text()).toContain("Disallow: /");
  });

  it("requires a valid Cloudflare Access token when Access is configured", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RS256");
    const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "RS256", use: "sig" };
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ keys: [jwk] }), { headers: { "content-type": "application/json" } }));
    const mw = await adminMiddleware({ CF_ACCESS_TEAM_DOMAIN: "cityseller.cloudflareaccess.com", CF_ACCESS_AUD: "aud-123" });

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
    expect((await mw(req(ADMIN, "/orders", { "cf-access-jwt-assertion": await sign("aud-123") }))).status).toBe(200);
  });

  it("passes requests through when Access is not configured (local dev)", async () => {
    const mw = await adminMiddleware();
    expect((await mw(req("localhost", "/orders"))).status).toBe(200);
  });
});
