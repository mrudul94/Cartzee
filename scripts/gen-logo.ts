/**
 * Builds web-ready logo files and favicons from the master logo.
 *   pnpm logo        (re-run after replacing shop/public/logo/logo-master.png)
 *
 * The master is a stacked logo (mark above the "Cartzee" wordmark) on a transparent background.
 * Output:
 *   {shop,admin}/public/logo/mark.png            the "C" mark, square
 *   {shop,admin}/public/logo/wordmark.png        dark wordmark (light backgrounds)
 *   {shop,admin}/public/logo/wordmark-white.png  white wordmark (dark backgrounds)
 *   shop/public/logo/logo-full.png               whole stacked logo, trimmed (structured data, emails)
 *   {shop,admin}/src/app/icon.png, apple-icon.png favicons (Next.js picks these up automatically)
 */
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MASTER = join(ROOT, "shop/public/logo/logo-master.png");
const APPS = ["shop", "admin"] as const;
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

/** Rows (top→bottom) that contain visible pixels, grouped into bands: [mark, wordmark]. */
async function bands(): Promise<[number, number][]> {
  const { data, info } = await sharp(MASTER).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out: [number, number][] = [];
  let start = -1;
  for (let y = 0; y <= info.height; y++) {
    let visible = false;
    if (y < info.height) for (let x = 0; x < info.width && !visible; x++) visible = data[(y * info.width + x) * 4 + 3]! > 40;
    if (visible && start < 0) start = y;
    if (!visible && start >= 0) {
      out.push([start, y - 1]);
      start = -1;
    }
  }
  if (out.length < 2) throw new Error(`Expected a mark and a wordmark in ${MASTER}, found ${out.length} band(s)`);
  return out;
}

const crop = async (top: number, bottom: number) => {
  const meta = await sharp(MASTER).metadata();
  const band = await sharp(MASTER).extract({ left: 0, top, width: meta.width!, height: bottom - top + 1 }).png().toBuffer();
  return sharp(band).trim({ background: clear, threshold: 1 }).png().toBuffer();
};

/** Centre on a transparent (or coloured) square with some breathing room. */
const square = async (img: Buffer, size: number, padding: number, background = clear) => {
  const inner = size - padding * 2;
  const fitted = await sharp(img).resize(inner, inner, { fit: "contain", background: clear }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: fitted }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
};

async function main() {
  const [[mTop, mBottom], [wTop, wBottom]] = (await bands()) as [[number, number], [number, number]];
  const mark = await crop(mTop, mBottom);
  const wordmark = await crop(wTop, wBottom);
  const full = await sharp(MASTER).trim({ background: clear, threshold: 1 }).png().toBuffer();

  const files: Record<string, Buffer> = {
    "logo/mark.png": await square(mark, 128, 0),
    "logo/wordmark.png": await sharp(wordmark).resize({ height: 96 }).png({ compressionLevel: 9, palette: true }).toBuffer(),
    // Same shape, every visible pixel turned white (for the dark footer).
    "logo/wordmark-white.png": await sharp(wordmark)
      .resize({ height: 96 })
      .composite([{ input: { create: { width: 1, height: 1, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }, tile: true, blend: "in" }])
      .png({ compressionLevel: 9, palette: true })
      .toBuffer(),
  };
  const icon = await square(mark, 512, 24);
  // iOS ignores transparency, so the home-screen icon gets a white tile.
  const apple = await square(mark, 180, 18, { r: 255, g: 255, b: 255, alpha: 1 });

  for (const app of APPS) {
    mkdirSync(join(ROOT, app, "public/logo"), { recursive: true });
    for (const [name, buf] of Object.entries(files)) await sharp(buf).toFile(join(ROOT, app, "public", name));
    await sharp(icon).toFile(join(ROOT, app, "src/app/icon.png"));
    await sharp(apple).toFile(join(ROOT, app, "src/app/apple-icon.png"));
    rmSync(join(ROOT, app, "src/app/icon.svg"), { force: true });
  }
  await sharp(full).resize({ width: 600 }).png({ compressionLevel: 9, palette: true }).toFile(join(ROOT, "shop/public/logo/logo-full.png"));
  console.log("Logo files written for shop and admin.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
