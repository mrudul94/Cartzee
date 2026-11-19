#!/usr/bin/env node
/**
 * Runs a command (e.g. the Cloudflare build) with the repo-root env files loaded first.
 *
 * Why: the shared secrets live in the root .env.local, and each app's next.config.ts reads them in.
 * That works for `next dev`, but during `next build` Next resets its environment before generating
 * static pages, so prerendered pages were built without the database (empty home/bestsellers pages).
 * Loading the root values into the environment *before* Next starts fixes that.
 *
 * Precedence is kept: values already in the environment win, then the app's own env files
 * (e.g. shop/.env.production.local with the live NEXT_PUBLIC_SITE_URL), then the root files.
 * Values are never printed.
 *
 * Usage (from an app folder):  node ../scripts/with-root-env.cjs opennextjs-cloudflare build
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const appDir = process.cwd();
const rootDir = path.resolve(__dirname, "..");
const FILES = [".env.production.local", ".env.local", ".env.production", ".env"];

/** Minimal dotenv parser: KEY=VALUE lines, optional quotes, # comments. */
function parse(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    if (!(m[1] in out)) out[m[1]] = value; // first file in FILES order wins, like Next.js
  }
  return out;
}

const collect = (dir) => FILES.reduce((acc, f) => ({ ...parse(path.join(dir, f)), ...acc }), {});
const appEnv = appDir === rootDir ? {} : collect(appDir);
const rootEnv = collect(rootDir);

let added = 0;
for (const [key, value] of Object.entries(rootEnv)) {
  if (process.env[key] !== undefined || key in appEnv) continue;
  process.env[key] = value;
  added++;
}
console.log(`[with-root-env] loaded ${added} value(s) from the root env files`);

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Usage: node ../scripts/with-root-env.cjs <command> [...args]");
  process.exit(1);
}
const result = spawnSync(cmd, args, { stdio: "inherit", shell: true, env: process.env });
process.exit(result.status ?? 1);
