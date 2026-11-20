/**
 * One-time copy of the store from the old Supabase project to a new one (e.g. Tokyo → Mumbai).
 *
 *   pnpm copy:db --dry     count what would be copied, change nothing
 *   pnpm copy:db           copy (overwrites the new project's copies of these rows)
 *   pnpm copy:db --missing only ADD what the new project doesn't have yet (new products with their photos,
 *                          categories, reviews, guides). Never changes or removes anything already there and
 *                          leaves the homepage/settings content alone. Combine with --dry to preview.
 *
 * Needs four lines in the root .env.local (remove them afterwards):
 *   COPY_FROM_SUPABASE_URL / COPY_FROM_SERVICE_ROLE_KEY   old project
 *   COPY_TO_SUPABASE_URL   / COPY_TO_SERVICE_ROLE_KEY     new project (all migrations already run)
 *
 * Copies: categories, products, product images (rows + uploaded files), reviews, guides (blog posts),
 * and the editable shop content (homepage, settings, pages, FAQs).
 * Skips: logins (customers and admins sign up / are re-added), orders, activity log, login codes.
 * Reviews keep their text but lose their link to the old account/order (those don't exist in the new project).
 * Rewrites old storage URLs to the new project and renames "City Seller" to "Cartzee" on the way.
 * Safe to re-run: rows are upserted by id. Keys are never printed.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry");
const MISSING = process.argv.includes("--missing");
const BUCKET = "product-images";

function env(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name} in the root .env.local (see the top of scripts/copy-db.ts).`);
  return v;
}

const fromUrl = env("COPY_FROM_SUPABASE_URL").replace(/\/+$/, "");
const toUrl = env("COPY_TO_SUPABASE_URL").replace(/\/+$/, "");
if (fromUrl === toUrl) throw new Error("COPY_FROM and COPY_TO point at the same project.");
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const from = createClient(fromUrl, env("COPY_FROM_SERVICE_ROLE_KEY"), opts);
const to = createClient(toUrl, env("COPY_TO_SERVICE_ROLE_KEY"), opts);

type Row = Record<string, unknown>;

/** Old storage links → new project; old brand → Cartzee. Applied to every copied value. */
const RENAMES: [RegExp, string][] = [
  [new RegExp(fromUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), toUrl],
  [/City Seller/g, "Cartzee"],
  [/CitySeller/g, "Cartzee"],
  [/city-seller/g, "cartzee"],
  [/cityseller/g, "cartzee"],
];
const rewrite = (row: Row): Row => {
  let s = JSON.stringify(row);
  for (const [re, by] of RENAMES) s = s.replace(re, by);
  return JSON.parse(s) as Row;
};

async function readAll(db: SupabaseClient, table: string, order = "id"): Promise<Row[]> {
  const out: Row[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await db.from(table).select("*").order(order).range(start, start + 999);
    if (error) throw new Error(`Reading ${table}: ${error.message}`);
    out.push(...(data as Row[]));
    if (data.length < 1000) return out;
  }
}

async function write(table: string, rows: Row[], key = "id") {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await to.from(table).upsert(rows.slice(i, i + 500), { onConflict: key });
    if (error) throw new Error(`Writing ${table}: ${error.message}`);
  }
}

/** Ids already in the new project for a table (used by --missing). */
async function targetIds(table: string): Promise<Set<string>> {
  return new Set((await readAll(to, table)).map((r) => String(r.id)));
}

type CopyOpts = { key?: string; prepare?: (r: Row) => Row; sort?: (a: Row, b: Row) => number; keep?: (r: Row) => boolean };

/**
 * Copies one table and returns the ids written. With --missing: only rows whose id (and URL slug) the new
 * project doesn't have yet, inserted (never updated), so nothing edited in the new project is overwritten.
 */
async function copyTable(table: string, { key = "id", prepare = (r: Row) => r, sort, keep }: CopyOpts = {}): Promise<Set<string>> {
  let rows = (await readAll(from, table, key)).map((r) => rewrite(prepare(r)));
  if (keep) rows = rows.filter(keep);
  let note = "";
  if (MISSING) {
    const existing = await readAll(to, table, key);
    const ids = new Set(existing.map((r) => String(r[key])));
    const slugs = new Set(existing.map((r) => r.slug).filter(Boolean));
    const fresh = rows.filter((r) => !ids.has(String(r[key])));
    const clash = fresh.filter((r) => r.slug && slugs.has(r.slug));
    rows = fresh.filter((r) => !(r.slug && slugs.has(r.slug)));
    if (clash.length) note = `  (skipped ${clash.length} whose URL is already used: ${clash.map((r) => r.slug).join(", ")})`;
  }
  if (sort) rows = rows.sort(sort);
  if (!DRY) {
    if (MISSING) {
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await to.from(table).insert(rows.slice(i, i + 500));
        if (error) throw new Error(`Writing ${table}: ${error.message}`);
      }
    } else await write(table, rows, key);
  }
  console.log(`${DRY ? "would copy" : "copied"} ${String(rows.length).padStart(5)}  ${table}${MISSING ? " (new only)" : ""}${note}`);
  if (MISSING && table === "products" && rows.length) console.log(`         ${rows.map((r) => String(r.title)).join(" · ")}`);
  return new Set(rows.map((r) => String(r[key])));
}

/** Every file path in the old bucket (folders are walked recursively). */
async function listFiles(prefix = ""): Promise<string[]> {
  const out: string[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await from.storage.from(BUCKET).list(prefix, { limit: 100, offset });
    if (error) throw new Error(`Listing images: ${error.message}`);
    for (const e of data) {
      const path = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) out.push(...(await listFiles(path)));
      else out.push(path);
    }
    if (data.length < 100) return out;
  }
}

async function copyImages() {
  const { error: missing } = await from.storage.getBucket(BUCKET);
  if (missing) return console.log(`no uploaded images (no "${BUCKET}" bucket in the old project)`);
  const files = await listFiles();
  if (DRY) return console.log(`would copy ${String(files.length).padStart(5)}  uploaded images`);

  const { error: noBucket } = await to.storage.getBucket(BUCKET);
  if (noBucket) {
    const { error } = await to.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"] });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Creating image bucket: ${error.message}`);
  }
  let done = 0;
  for (const path of files) {
    const { data, error } = await from.storage.from(BUCKET).download(path);
    if (error) throw new Error(`Downloading ${path}: ${error.message}`);
    const up = await to.storage.from(BUCKET).upload(path, data, { contentType: data.type || undefined, cacheControl: "31536000", upsert: !MISSING });
    // --missing: files already in the new project are left as they are.
    if (up.error && !(MISSING && /exists|duplicate/i.test(up.error.message))) throw new Error(`Uploading ${path}: ${up.error.message}`);
    if (++done % 25 === 0) console.log(`  … ${done}/${files.length} images`);
  }
  console.log(`copied ${String(files.length).padStart(5)}  uploaded images`);
}

async function main() {
  console.log(`${DRY ? "Dry run: nothing will be changed." : "Copying old project → new project."}${MISSING ? " Only adding what the new project is missing." : ""}\n`);
  await copyImages();
  // Parents before subcategories (categories point at their parent).
  await copyTable("categories", { sort: (a, b) => Number(a.parent_id != null) - Number(b.parent_id != null) });
  // --missing: a product whose category isn't in the new project is skipped (it would fail to insert).
  const categories = MISSING && !DRY ? await targetIds("categories") : null;
  const inCategories = (r: Row) => !categories || (categories.has(String(r.category_id)) && (r.subcategory_id == null || categories.has(String(r.subcategory_id))));
  // search_vector is computed by the database; bought_count/rating are kept as they were.
  const added = await copyTable("products", { prepare: ({ search_vector: _, ...r }) => r, keep: inCategories });
  // --missing: photos only for the products just added (products already there keep their photos as edited).
  await copyTable("product_images", { keep: (r) => !MISSING || added.has(String(r.product_id)) });
  await copyTable("blog_posts");
  if (MISSING) console.log("skipped        site_content (homepage, settings and pages stay as you edited them)");
  else await copyTable("site_content", { key: "key" });
  // --missing: only reviews for products that exist in the new project.
  const products = MISSING && !DRY ? await targetIds("products") : null;
  await copyTable("reviews", { prepare: (r) => ({ ...r, user_id: null, order_id: null }), keep: (r) => !products || products.has(String(r.product_id)) });
  console.log(DRY ? "\nDry run finished." : "\nDone. Now point .env.local at the new project (see the chat for steps).");
}

main().catch((e) => {
  console.error(`\nCopy stopped: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
