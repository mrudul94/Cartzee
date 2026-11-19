#!/usr/bin/env node
/**
 * Removes secrets from the Cloudflare build before it is uploaded.
 *
 * OpenNext copies every value from the app's and the repo root's .env files into
 * .open-next/cloudflare/next-env.mjs, which is bundled into the Worker code. Server secrets
 * (Supabase service key, Razorpay secret, Resend key…) must not be shipped that way: on Cloudflare
 * they come from Worker secrets (`wrangler secret put` / `secret bulk`). This keeps only public
 * NEXT_PUBLIC_* values and fails the deploy if the file can't be cleaned.
 *
 * Usage (from an app folder, after `opennextjs-cloudflare build`): node ../scripts/strip-build-secrets.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), ".open-next", "cloudflare", "next-env.mjs");
if (!fs.existsSync(file)) {
  console.error(`[strip-build-secrets] ${file} not found: run the Cloudflare build first.`);
  process.exit(1);
}

const isPublic = (key) => key.startsWith("NEXT_PUBLIC_");
let removed = 0;
const out = fs
  .readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map((line) => {
    const m = line.match(/^export const (\w+) = (\{.*\});$/);
    if (!m) return line;
    const values = JSON.parse(m[2]);
    const kept = Object.fromEntries(Object.entries(values).filter(([k]) => isPublic(k)));
    removed += Object.keys(values).length - Object.keys(kept).length;
    return `export const ${m[1]} = ${JSON.stringify(kept)};`;
  })
  .join("\n");

// Safety net: every exported object must now hold public keys only.
for (const m of out.matchAll(/^export const \w+ = (\{.*\});$/gm)) {
  if (Object.keys(JSON.parse(m[1])).some((k) => !isPublic(k))) {
    console.error("[strip-build-secrets] could not clean next-env.mjs; refusing to continue.");
    process.exit(1);
  }
}
fs.writeFileSync(file, out);
console.log(`[strip-build-secrets] removed ${removed} non-public value(s) from the build; secrets come from Cloudflare Worker secrets.`);
