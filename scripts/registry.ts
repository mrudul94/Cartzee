/**
 * Component registry tooling.
 *   pnpm registry:sync   → recompute usedIn / tokensUsed / lastUpdated in registry.json and regenerate COMPONENTS.md
 *   pnpm check:registry  → fail if any file/export is unregistered, an entry points nowhere, a UI entry has no
 *                           /design-system demo, or registry.json / COMPONENTS.md are out of sync.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { aspect, color, duration, font, maxWidth, radius, shadow, space, zIndex } from "../shared/src/design-system/tokens";

type Entry = {
  name: string;
  path: string;
  category: string;
  description: string;
  variants: string[];
  sizes?: Record<string, string>;
  props: Record<string, string>;
  tokensUsed: string[];
  usedIn: string[];
  accessibility: string;
  example: string;
  lastUpdated: string;
};

const ROOT = process.cwd();
const REG = join(ROOT, "shared/src/design-system/registry.json");
const MD = join(ROOT, "shared/src/design-system/COMPONENTS.md");
const DEMOS = join(ROOT, "admin/src/app/design-system/demos.tsx");
const SCOPED = ["shared/src/components", "shared/src/hooks", "shared/src/lib/utils", "shared/src/lib/seo", "admin/src/components"];
const DEMO_CATEGORIES = /^(ui\/|commerce|section|layout|admin)/;
const check = process.argv.includes("--check");

const walk = (dir: string): string[] =>
  readdirSync(join(ROOT, dir)).flatMap((f) => {
    const rel = `${dir}/${f}`;
    return statSync(join(ROOT, rel)).isDirectory() ? walk(rel) : /\.(tsx?|mts)$/.test(f) ? [rel] : [];
  });

const registry = JSON.parse(readFileSync(REG, "utf8")) as { version: number; components: Entry[] };
const entries = registry.components;
const errors: string[] = [];

/* ------------------------------------------------------------ coverage */
const scopedFiles = SCOPED.flatMap(walk);
for (const file of scopedFiles) {
  const own = entries.filter((e) => e.path === file);
  if (own.length === 0) errors.push(`Unregistered file: ${file}`);
  const src = readFileSync(join(ROOT, file), "utf8");
  for (const m of src.matchAll(/export (?:async )?function (\w+)/g)) {
    if (!entries.some((e) => e.name === m[1] && e.path === file)) errors.push(`Unregistered export ${m[1]} in ${file}`);
  }
}
const seen = new Set<string>();
for (const e of entries) {
  if (seen.has(e.name)) errors.push(`Duplicate registry name: ${e.name}`);
  seen.add(e.name);
  try {
    statSync(join(ROOT, e.path));
  } catch {
    errors.push(`Registry entry ${e.name} points to missing file ${e.path}`);
  }
}

/* ------------------------------------------------------------ demos */
const demos = (() => {
  try {
    return readFileSync(DEMOS, "utf8");
  } catch {
    return "";
  }
})();
for (const e of entries) {
  if (DEMO_CATEGORIES.test(e.category) && !new RegExp(`^\\s+${e.name}:`, "m").test(demos)) {
    errors.push(`No /design-system demo for ${e.name} (add a "${e.name}:" key in demos.tsx)`);
  }
}

/* ------------------------------------------------------------ usedIn */
const allFiles = ["shared/src", "shop/src", "admin/src"].flatMap(walk);
const texts = new Map(allFiles.map((f) => [f, readFileSync(join(ROOT, f), "utf8")]));

function labelFor(file: string): string {
  const app = file.match(/^(shop|admin)\/src\/app/);
  if (app) {
    const route = file
      .replace(/^(shop|admin)\/src\/app/, "")
      .replace(/\/\([^)]+\)/g, "")
      .replace(/\/(page|layout|route|not-found)\.tsx?$/, (_, kind: string) => (kind === "page" ? "" : ` (${kind})`));
    return `${app[1]}:${route || "/"}`;
  }
  const own = entries.filter((e) => e.path === file);
  // Single-entry files are labelled by the entry; multi-entry files by "folder/File".
  if (own.length === 1) return own[0]!.name;
  return file.replace(/^(shared|admin|shop)\/src\/(components\/)?/, "").replace(/\.tsx?$/, "");
}

function usedIn(e: Entry): string[] {
  const mod = basename(e.path, extname(e.path));
  const importRe = new RegExp(`import[^;]*\\b${e.name}\\b[^;]*from\\s+["'][^"']*/${mod}["']`);
  const out = new Set<string>();
  for (const [file, text] of texts) {
    if (file.startsWith("admin/src/app/design-system/")) continue; // the style guide uses everything
    if (file === e.path) {
      // same-file use by another registered entry (e.g. OrderSummary uses FreeShippingProgress)
      const others = entries.filter((o) => o.path === file && o.name !== e.name);
      if (others.length && new RegExp(`<${e.name}[\\s/>]|\\b${e.name}\\(`).test(text.replace(new RegExp(`function ${e.name}\\b`), ""))) {
        others.forEach((o) => out.add(o.name));
      }
      continue;
    }
    if (importRe.test(text)) out.add(labelFor(file));
  }
  return [...out].filter((x) => x !== e.name).sort();
}

/* ------------------------------------------------------------ tokensUsed */
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const colorKeys = new Set(Object.keys(color).map(kebab));
const spaceKeys = new Set(Object.keys(space).map(String));
const SPACE_PREFIX = /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|h|w|min-h|min-w|max-h|size|top|left|right|bottom|inset|inset-x|inset-y|translate-x|translate-y|-mx|-m|-mt|-mb|-ml|-mr|-translate-x|-translate-y)$/;

function tokensIn(text: string): string[] {
  const out = new Set<string>();
  const classes = text.match(/[!\w:\[\]=-]*-?[a-z][\w-]*-[\w./-]+/g) ?? [];
  for (const raw of classes) {
    const cls = raw.split(":").pop()!;
    const m = cls.match(/^(-?[a-z]+(?:-[xy])?(?:-(?:h|w|x|y))?)-(.+)$/);
    if (!m) continue;
    let [, prefix, value] = m as unknown as [string, string, string];
    value = value.split("/")[0]!;
    if (/^(bg|text|border|ring|fill|stroke|divide|from|to|outline|accent)$/.test(prefix) && colorKeys.has(value)) out.add(`color.${camel(value)}`);
    else if (prefix === "text" && value in font.size) out.add(`font.size.${value}`);
    else if (prefix === "rounded" && value in radius) out.add(`radius.${value}`);
    else if (prefix === "shadow" && value in shadow) out.add(`shadow.${value}`);
    else if (prefix === "max-w" && value in maxWidth) out.add(`maxWidth.${value}`);
    else if (prefix === "z" && value in zIndex) out.add(`zIndex.${value}`);
    else if (prefix === "duration" && value in duration) out.add(`duration.${value}`);
    else if (prefix === "font" && value in font.family) out.add(`font.family.${value}`);
    else if (prefix === "font" && value in font.weight) out.add(`font.weight.${value}`);
    else if (prefix === "leading" && value in font.lineHeight) out.add(`font.lineHeight.${value}`);
    else if (prefix === "tracking" && value in font.tracking) out.add(`font.tracking.${value}`);
    else if (prefix === "aspect" && value in aspect) out.add(`aspect.${value}`);
    else if (SPACE_PREFIX.test(prefix) && spaceKeys.has(value)) out.add(`space.${value}`);
  }
  return [...out].sort();
}

/* ------------------------------------------------------------ sync */
let drift = false;
for (const e of entries) {
  const text = texts.get(e.path);
  if (!text) continue;
  const nextUsed = usedIn(e);
  const nextTokens = /\.(tsx)$/.test(e.path) ? tokensIn(text) : [];
  if (JSON.stringify(nextUsed) !== JSON.stringify(e.usedIn) || JSON.stringify(nextTokens) !== JSON.stringify(e.tokensUsed)) {
    drift = true;
    if (check) errors.push(`registry.json out of date for ${e.name} (run pnpm registry:sync)`);
    e.usedIn = nextUsed;
    e.tokensUsed = nextTokens;
  }
  if (!check) e.lastUpdated = statSync(join(ROOT, e.path)).mtime.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------ COMPONENTS.md */
const order = ["ui/", "commerce", "section", "layout", "admin", "hook", "util", "seo"];
const rank = (c: string) => order.findIndex((o) => c.startsWith(o));
const sorted = [...entries].sort((a, b) => rank(a.category) - rank(b.category) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
const esc = (s: string) => s.replace(/\|/g, "\\|");
const md = [
  "# City Seller component registry",
  "",
  "> Generated from `registry.json` by `pnpm registry:sync`. Do not edit by hand; edit `registry.json` instead.",
  "",
  "**Reuse-first rule:** before creating any UI element, search this list. Reuse via props/variants/tokens, extend an existing",
  "component with a new variant if it is close, and only create a new component (then register it) if nothing similar exists.",
  "Live previews: `/design-system`.",
  "",
  `Total entries: **${entries.length}**`,
  "",
  "| Name | Category | Path | Description | Variants | Used in |",
  "|---|---|---|---|---|---|",
  ...sorted.map(
    (e) =>
      `| [${e.name}](#${e.name.toLowerCase()}) | ${e.category} | \`${e.path}\` | ${esc(e.description)} | ${e.variants.join(", ") || "–"} | ${e.usedIn.length} |`,
  ),
  "",
  ...sorted.flatMap((e) => [
    `## ${e.name}`,
    "",
    `\`${e.path}\` · ${e.category} · updated ${e.lastUpdated}`,
    "",
    e.description,
    "",
    ...(Object.keys(e.props).length ? ["**Props**", "", ...Object.entries(e.props).map(([k, v]) => `- \`${k}\`: ${v}`), ""] : []),
    ...(e.variants.length ? [`**Variants:** ${e.variants.join(", ")}`, ""] : []),
    ...(e.sizes ? [`**Sizes:** ${Object.entries(e.sizes).map(([k, v]) => `${k} (\`${v}\`)`).join(", ")}`, ""] : []),
    ...(e.tokensUsed.length ? [`**Tokens:** ${e.tokensUsed.map((t) => `\`${t}\``).join(" ")}`, ""] : []),
    ...(e.accessibility ? [`**Accessibility:** ${e.accessibility}`, ""] : []),
    ...(e.usedIn.length ? [`**Used in:** ${e.usedIn.join(", ")}`, ""] : []),
    ...(e.example ? ["```tsx", e.example, "```", ""] : []),
  ]),
].join("\n");

if (check) {
  let current = "";
  try {
    current = readFileSync(MD, "utf8");
  } catch {
    /* missing */
  }
  const norm = (s: string) => s.replace(/updated \d{4}-\d{2}-\d{2}/g, "").trimEnd();
  if (norm(current) !== norm(md)) {
    if (!drift) errors.push("COMPONENTS.md out of date (run pnpm registry:sync)");
  }
  if (errors.length) {
    console.error(`Registry check failed (${errors.length}):\n - ${errors.join("\n - ")}`);
    process.exit(1);
  }
  console.log(`Registry OK: ${entries.length} entries, ${scopedFiles.length} files covered.`);
} else {
  writeFileSync(REG, JSON.stringify(registry, null, 2) + "\n");
  writeFileSync(MD, md + "\n");
  console.log(`Synced ${entries.length} entries → registry.json + COMPONENTS.md`);
  if (errors.length) console.warn(`Warnings (${errors.length}):\n - ${errors.join("\n - ")}`);
  void relative;
}
