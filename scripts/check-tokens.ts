/**
 * Fails if any component contains raw design values instead of tokens:
 *  - hex colours (#fff, #B84A33), rgb()/rgba()/hsl() colours
 *  - pixel literals (12px) outside `sizes=` image hints
 *  - Tailwind arbitrary values (w-[13px], bg-[#fff]); arbitrary *variants* like data-[state=open]: are allowed
 * Run: pnpm check:tokens
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIRS = ["shared/src/components", "admin/src/components"];
const walk = (dir: string): string[] =>
  readdirSync(join(ROOT, dir)).flatMap((f) => {
    const rel = `${dir}/${f}`;
    return statSync(join(ROOT, rel)).isDirectory() ? walk(rel) : /\.tsx?$/.test(f) ? [rel] : [];
  });

const rules: { name: string; re: RegExp; skip?: (line: string, match: RegExpMatchArray) => boolean }[] = [
  { name: "hex colour", re: /(?<![\w&])#[0-9a-fA-F]{3,8}\b/g, skip: (l) => /href=|#main|#reviews|`#/.test(l) },
  { name: "rgb/hsl colour", re: /\b(?:rgba?|hsla?)\(/g },
  { name: "pixel literal", re: /\b\d+(?:\.\d+)?px\b/g, skip: (l) => /\bsizes[=:]/.test(l) },
  {
    name: "arbitrary Tailwind value",
    re: /[\w-]*-\[[^\]\s]+\](?!:)/g,
    skip: (_l, m) => /^(?:group-|peer-)?(?:data|aria)-/.test(m[0]),
  },
];

let failures = 0;
for (const file of DIRS.flatMap(walk)) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const rule of rules) {
      for (const m of line.matchAll(rule.re)) {
        if (rule.skip?.(line, m)) continue;
        failures++;
        console.error(`${file}:${i + 1}  ${rule.name}: ${m[0]}`);
      }
    }
  });
}

if (failures) {
  console.error(`\n${failures} raw value(s) found. Use design tokens (shared/src/design-system/tokens.ts) instead.`);
  process.exit(1);
}
console.log("Token check passed: no raw colours, pixel values or arbitrary values in components.");
