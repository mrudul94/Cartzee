import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Cloudflare Access gate for the admin website (defence in depth).
 *
 * Cloudflare Access sits in front of admin.cityseller.in and only lets approved emails through.
 * It then adds a signed JWT (`Cf-Access-Jwt-Assertion` header / `CF_Authorization` cookie) to every
 * request. Verifying that JWT here means a request that reaches the app without passing Access —
 * e.g. via a *.workers.dev URL or a spoofed Host header — is refused.
 *
 * Env: CF_ACCESS_TEAM_DOMAIN (e.g. "cityseller.cloudflareaccess.com"), CF_ACCESS_AUD (application AUD tag).
 * Edge-safe (runs in middleware); uses WebCrypto via jose.
 */

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let jwksTeam: string | undefined;

export type AccessConfig = { teamDomain?: string; audience?: string };

export const accessConfig = (): AccessConfig => ({
  teamDomain: process.env.CF_ACCESS_TEAM_DOMAIN?.trim() || undefined,
  audience: process.env.CF_ACCESS_AUD?.trim() || undefined,
});

export const isAccessConfigured = (c = accessConfig()) => Boolean(c.teamDomain && c.audience);

/** Returns the verified Access email, or null if the token is missing/invalid. */
export async function verifyAccessToken(token: string | undefined | null, c = accessConfig()): Promise<string | null> {
  if (!token || !c.teamDomain || !c.audience) return null;
  if (!jwks || jwksTeam !== c.teamDomain) {
    jwks = createRemoteJWKSet(new URL(`https://${c.teamDomain}/cdn-cgi/access/certs`));
    jwksTeam = c.teamDomain;
  }
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: `https://${c.teamDomain}`, audience: c.audience });
    return typeof payload.email === "string" ? payload.email : (payload.sub ?? null);
  } catch {
    return null;
  }
}
