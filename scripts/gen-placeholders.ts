/**
 * Generates neutral-background SVG placeholder art for seed products, categories,
 * banners, review photos and guide covers. Run: pnpm placeholders
 * Replace with real photography (uniform light background) before launch.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { color } from "../shared/src/design-system/tokens";
import { seedCategories } from "../shared/src/lib/seed/categories";
import { seedPosts } from "../shared/src/lib/seed/posts";
import { seedProducts } from "../shared/src/lib/seed/products";

const OUT = join(process.cwd(), "shop", "public", "placeholders");
const BG = "#F1ECE4";
const INK = color.text;

const hue: Record<string, string> = {
  Clear: "#BCD3D9",
  Black: "#3A3836",
  Green: "#7FA77A",
  Grey: "#9A9690",
  Beige: "#D8C6AA",
  Blue: "#6E93C2",
  Multicolour: "#C98B6B",
  Natural: "#C9A86A",
  Silver: "#B9BDC2",
  White: "#F7F5F2",
  "Off-white": "#EDE5D6",
  "Warm white": "#F2C66D",
};

type Shape = (c: string) => string;
const s = (strings: TemplateStringsArray, ...v: unknown[]) => String.raw(strings, ...v);

const shapes: Record<string, Shape> = {
  jar: (c) => s`<g>${[0, 1, 2]
    .map((i) => `<rect x="${190 + i * 150}" y="300" width="120" height="240" rx="18" fill="${c}" stroke="${INK}" stroke-opacity=".25" stroke-width="4"/><rect x="${184 + i * 150}" y="270" width="132" height="40" rx="10" fill="#8C8781"/>`)
    .join("")}</g>`,
  spice: (c) => s`<ellipse cx="400" cy="560" rx="200" ry="26" fill="#8C8781"/>${[0, 1, 2, 3, 4]
    .map((i) => `<rect x="${225 + i * 72}" y="380" width="56" height="150" rx="12" fill="${c}" stroke="${INK}" stroke-opacity=".25" stroke-width="3"/><rect x="${225 + i * 72}" y="360" width="56" height="26" rx="6" fill="#C9CCD0"/>`)
    .join("")}`,
  pan: (c) => s`<circle cx="360" cy="420" r="190" fill="${c}"/><circle cx="360" cy="420" r="160" fill="#4A4744"/><rect x="540" y="400" width="200" height="40" rx="20" fill="#2B2A28"/>`,
  chopper: (c) => s`<path d="M260 360 h280 l-30 200 h-220z" fill="#FFFFFF" fill-opacity=".8" stroke="${INK}" stroke-opacity=".25" stroke-width="4"/><rect x="240" y="320" width="320" height="50" rx="16" fill="${c}"/><circle cx="400" cy="300" r="26" fill="${c}"/><path d="M400 300 q60 -80 140 -60" stroke="${INK}" stroke-width="5" fill="none"/>`,
  box: (c) => s`<rect x="170" y="330" width="460" height="230" rx="14" fill="${c}" stroke="${INK}" stroke-opacity=".2" stroke-width="4"/><rect x="250" y="380" width="300" height="120" rx="8" fill="#FFFFFF" fill-opacity=".55"/><rect x="200" y="260" width="400" height="80" rx="14" fill="${c}" opacity=".85"/>`,
  bag: (c) => s`<rect x="200" y="260" width="400" height="300" rx="16" fill="${c}" fill-opacity=".7" stroke="#7A2E2E" stroke-width="12"/><path d="M215 290 h370" stroke="${INK}" stroke-opacity=".4" stroke-width="4" stroke-dasharray="10 8"/>`,
  rack: (c) => s`<g stroke="${c}" stroke-width="14" fill="none"><path d="M240 180 v420 M560 180 v420"/>${[220, 330, 440, 550].map((y) => `<path d="M240 ${y} h320"/>`).join("")}</g>`,
  mop: (c) => s`<rect x="420" y="120" width="16" height="360" fill="#9A9690"/><ellipse cx="428" cy="500" rx="90" ry="30" fill="#E8E2D8"/><path d="M170 420 h220 l-26 170 h-168z" fill="${c}"/><circle cx="215" cy="600" r="14" fill="${INK}"/><circle cx="345" cy="600" r="14" fill="${INK}"/>`,
  cloth: (c) => s`${["#6E93C2", "#7FA77A", "#E0B04F", c]
    .map((f, i) => `<rect x="${210 + i * 30}" y="${250 + i * 40}" width="300" height="220" rx="16" fill="${f}" transform="rotate(${i * 4 - 6} 400 400)"/>`)
    .join("")}`,
  brush: (c) => s`<rect x="230" y="420" width="340" height="80" rx="30" fill="${c}"/><rect x="380" y="260" width="40" height="170" rx="16" fill="${c}"/><g fill="#E0B04F"><rect x="250" y="500" width="300" height="40" rx="10"/></g>`,
  broom: (c) => s`<rect x="388" y="110" width="24" height="330" rx="10" fill="#7A5A3A"/><path d="M400 430 l-140 200 h280z" fill="${c}"/><rect x="360" y="420" width="80" height="30" rx="8" fill="#B84A33"/>`,
  shelf: (c) => s`<g fill="${c}" stroke="${INK}" stroke-opacity=".25" stroke-width="4">${[300, 470]
    .map((y) => `<path d="M220 ${y} h360 l-180 70z"/>`)
    .join("")}</g><rect x="440" y="230" width="44" height="70" rx="10" fill="#6E93C2"/><rect x="300" y="400" width="40" height="70" rx="10" fill="#7FA77A"/>`,
  dispenser: (c) => s`<rect x="250" y="320" width="130" height="220" rx="40" fill="${c}" stroke="${INK}" stroke-opacity=".2" stroke-width="4"/><rect x="300" y="270" width="30" height="54" fill="#9A9690"/><path d="M300 270 h70" stroke="#9A9690" stroke-width="16"/><rect x="420" y="380" width="120" height="160" rx="24" fill="${c}" stroke="${INK}" stroke-opacity=".2" stroke-width="4"/><rect x="220" y="540" width="360" height="30" rx="14" fill="${c}"/>`,
  mat: (c) => s`<rect x="170" y="260" width="460" height="300" rx="40" fill="${c}"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${220 + (i % 6) * 72}" cy="${300 + Math.floor(i / 6) * 70}" r="10" fill="#FFFFFF" fill-opacity=".35"/>`).join("")}`,
  hanging: (c) => s`<rect x="220" y="200" width="360" height="18" rx="9" fill="#9C7A55"/>${Array.from({ length: 13 }, (_, i) => `<path d="M${240 + i * 26} 218 v${260 + (i % 2) * 30 + Math.abs(6 - i) * 14}" stroke="${c}" stroke-width="10" stroke-linecap="round"/>`).join("")}<path d="M240 300 l160 120 l160 -120" stroke="${c}" stroke-width="14" fill="none"/>`,
  vase: (c) => s`<path d="M200 560 c-40 -120 40 -140 30 -220 h60 c-10 80 70 100 30 220z" fill="#C8553D"/><path d="M350 560 c-60 -170 60 -200 40 -330 h60 c-20 130 100 160 40 330z" fill="${c}"/><path d="M520 560 c-40 -90 30 -110 20 -160 h50 c-10 50 60 70 20 160z" fill="#E6D9C3"/>`,
  lights: (c) => s`<path d="M120 300 q140 140 280 0 t280 0" stroke="#B38B4D" stroke-width="4" fill="none"/>${Array.from({ length: 13 }, (_, i) => {
    const x = 120 + i * 46.6;
    const y = 300 + Math.sin((i / 12) * Math.PI * 2) * -48;
    return `<circle cx="${x}" cy="${y + 60}" r="18" fill="${c}"/><circle cx="${x}" cy="${y + 60}" r="34" fill="${c}" fill-opacity=".25"/>`;
  }).join("")}`,
  hooks: (c) => s`${[0, 1, 2]
    .map((i) => `<rect x="${200 + i * 150}" y="280" width="100" height="100" rx="14" fill="#FFFFFF" fill-opacity=".7" stroke="${INK}" stroke-opacity=".2" stroke-width="3"/><path d="M${250 + i * 150} 330 v120 a30 30 0 0 1 -60 0" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/>`)
    .join("")}`,
  stopper: (c) => s`<rect x="120" y="380" width="560" height="70" rx="35" fill="${c}"/><rect x="120" y="460" width="560" height="70" rx="35" fill="${c}" opacity=".8"/><rect x="390" y="250" width="20" height="300" fill="#C9A86A" opacity=".6"/>`,
};

const shapeFor: Record<string, keyof typeof shapes> = {
  "airtight-jar-set-6pc": "jar",
  "glass-spice-jar-set-12pc": "spice",
  "non-stick-tawa-28cm": "pan",
  "vegetable-chopper-900ml": "chopper",
  "foldable-wardrobe-organiser-6pc": "box",
  "saree-cover-bags-12pc": "bag",
  "4-tier-multipurpose-rack": "rack",
  "under-sink-organiser-2tier": "rack",
  "spin-mop-bucket-set": "mop",
  "microfibre-cloth-pack-10": "cloth",
  "kitchen-sink-scrubber-set": "brush",
  "soft-grass-broom": "broom",
  "bathroom-corner-shelf-2pc": "shelf",
  "ceramic-soap-dispenser-set": "dispenser",
  "anti-slip-bath-mat": "mat",
  "macrame-wall-hanging": "hanging",
  "ceramic-vase-set-3pc": "vase",
  "led-string-lights-10m": "lights",
  "adhesive-wall-hooks-12pc": "hooks",
  "door-draft-stopper-90cm": "stopper",
};

const svg = (w: number, h: number, body: string, bg = BG) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/>${body}</svg>\n`;

function view(n: number, art: string) {
  switch (n) {
    case 1:
      return art;
    case 2:
      return `<g transform="rotate(-8 400 400) translate(10 10)">${art}</g>`;
    case 3:
      return `<g transform="translate(-280 -260) scale(1.7)">${art}</g>`;
    case 4:
      return `<rect x="0" y="560" width="800" height="240" fill="#E3D8C8"/><rect x="60" y="80" width="220" height="160" rx="8" fill="#FFFFFF" fill-opacity=".6"/>${art}`;
    default:
      return `${art}<g stroke="${INK}" stroke-width="3" fill="${INK}" font-family="sans-serif" font-size="28"><path d="M150 650 h500 M150 635 v30 M650 635 v30"/><path d="M110 200 v400 M95 200 h30 M95 600 h30"/></g>`;
  }
}

function write(rel: string, content: string) {
  const file = join(OUT, rel);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, content);
}

let count = 0;
for (const p of seedProducts) {
  const draw = shapes[shapeFor[p.slug] ?? "box"]!;
  const c = hue[p.colour] ?? "#C9B79C";
  for (let n = 1; n <= 5; n++) {
    write(`products/${p.slug}-${n}.svg`, svg(800, 800, view(n, draw(c))));
    count++;
  }
}

const catShape: Record<string, keyof typeof shapes> = {
  kitchen: "jar", storage: "box", cleaning: "mop", bathroom: "dispenser", "home-decor": "vase", "home-improvement": "hooks",
  "storage-containers": "jar", cookware: "pan", "kitchen-tools": "chopper", "wardrobe-organisers": "box", "shelves-racks": "rack",
  "mops-brooms": "broom", "cleaning-tools": "cloth", "bath-storage": "shelf", "bath-accessories": "mat", "wall-decor": "hanging",
  "vases-planters": "vase", lighting: "lights", "hooks-hardware": "hooks", "door-window": "stopper",
};
for (const c of seedCategories) {
  write(`categories/${c.slug}.svg`, svg(800, 800, shapes[catShape[c.slug] ?? "box"]!("#D9B8A0"), "#EFE7DC"));
  count++;
}

// Banners: hero (desktop 16:9 art) and category sale banners (3:1). Text is rendered by components, not baked in.
write("banners/hero.svg", svg(1600, 900, `<g transform="translate(700 50) scale(1.1)">${shapes.vase!("#E6D9C3")}</g><g transform="translate(980 260) scale(.8)">${shapes.jar!("#BCD3D9")}</g>`, "#E8DED1"));
write("banners/flash-sale.svg", svg(1500, 500, `<g transform="translate(900 -120) scale(.9)">${shapes.rack!("#3A3836")}</g>`, "#F6E3DD"));
for (const slug of ["kitchen", "cleaning", "bathroom", "home-decor"]) {
  write(`banners/${slug}.svg`, svg(1500, 500, `<g transform="translate(860 -110) scale(.85)">${shapes[catShape[slug]!]!("#D9B8A0")}</g>`, "#E8DED1"));
  count++;
}
for (let i = 1; i <= 4; i++) {
  write(`reviews/review-${i}.svg`, svg(400, 400, `<g transform="scale(.5)">${Object.values(shapes)[i * 3]!("#C9B79C")}</g>`, "#EDE6DB"));
  count++;
}
const guideShape: Record<string, keyof typeof shapes> = { "storage-containers": "jar", "spin-mop": "mop", bathroom: "shelf" };
for (const post of seedPosts) {
  const key = post.cover.split("/").pop()!.replace(".svg", "");
  write(`guides/${key}.svg`, svg(1200, 675, `<g transform="translate(200 -60)">${shapes[guideShape[key] ?? "box"]!("#D9B8A0")}</g>`, "#E8DED1"));
  count++;
}
write("og-default.svg", svg(1200, 630, `<g transform="translate(600 -90) scale(.85)">${shapes.vase!("#E6D9C3")}</g>`, "#FAF7F2"));

console.log(`Wrote ${count + 3} placeholder SVGs to public/placeholders`);
