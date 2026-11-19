/**
 * One-time copy of the store from the old Supabase project to a new one (e.g. Tokyo → Mumbai).
 *
 *   pnpm copy:db --dry     count what would be copied, change nothing
 *   pnpm copy:db           copy
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

async function copyTable(table: string, { key = "id", prepare = (r: Row) => r, sort }: { key?: string; prepare?: (r: Row) => Row; sort?: (a: Row, b: Row) => number } = {}) {
  let rows = (await readAll(from, table, key)).map((r) => rewrite(prepare(r)));
  if (sort) rows = rows.sort(sort);
  if (!DRY) await write(table, rows, key);
  console.log(`${DRY ? "would copy" : "copied"} ${String(rows.length).padStart(5)}  ${table}`);
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
    const up = await to.storage.from(BUCKET).upload(path, data, { contentType: data.type || undefined, cacheControl: "31536000", upsert: true });
    if (up.error) throw new Error(`Uploading ${path}: ${up.error.message}`);
    if (++done % 25 === 0) console.log(`  … ${done}/${files.length} images`);
  }
  console.log(`copied ${String(files.length).padStart(5)}  uploaded images`);
}

async function main() {
  console.log(DRY ? "Dry run: nothing will be changed.\n" : "Copying old project → new project.\n");
  await copyImages();
  // Parents before subcategories (categories point at their parent).
  await copyTable("categories", { sort: (a, b) => Number(a.parent_id != null) - Number(b.parent_id != null) });
  // search_vector is computed by the database; bought_count/rating are kept as they were.
  await copyTable("products", { prepare: ({ search_vector: _, ...r }) => r });
  await copyTable("product_images");
  await copyTable("blog_posts");
  await copyTable("site_content", { key: "key" });
  await copyTable("reviews", { prepare: (r) => ({ ...r, user_id: null, order_id: null }) });
  console.log(DRY ? "\nDry run finished." : "\nDone. Now point .env.local at the new project (see the chat for steps).");
}

main().catch((e) => {
  console.error(`\nCopy stopped: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
