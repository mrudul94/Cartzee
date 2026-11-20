/**
 * Demo catalogue so the shop can be judged with full rows (not for sale).
 *
 *   pnpm demo:add --dry   show what would be added
 *   pnpm demo:add         add ~8 sample products to every main category
 *   pnpm demo:remove      delete every sample product (run before launch)
 *
 * Needs migration 0013 (products.is_demo + the "not for sale" check) in the database first.
 * Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the root .env.local (never printed).
 *
 * Sample products look like normal products in the shop, but checkout refuses them, and the admin
 * product list marks them "Demo". Photos are reused from your own products in the same category.
 * They get no ratings, reviews or "bought" counts: those must only ever come from real customers.
 */
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry");
const REMOVE = process.argv.includes("--remove");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the root .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

/** [title, price, mrp, material, colour] */
type Item = [string, number, number, string, string];

const CATALOGUE: [RegExp, Item[]][] = [
  [/kitchen|cook|dining/i, [
    ["Stainless Steel Masala Dabba with 7 Bowls", 349, 799, "Stainless steel", "Silver"],
    ["Non-Stick Dosa Tawa 28 cm", 529, 1199, "Aluminium", "Black"],
    ["Airtight Glass Storage Jars, Set of 3", 449, 999, "Glass", "Clear"],
    ["Vegetable Chopper with Pull Cord, 650 ml", 199, 499, "Plastic", "Green"],
    ["Wooden Spatula Set of 5", 249, 599, "Neem wood", "Natural"],
    ["Silicone Oil Brush and Bottle", 149, 349, "Silicone", "Red"],
    ["Stainless Steel Lunch Box, 3 Tier", 599, 1299, "Stainless steel", "Silver"],
    ["Insulated Water Bottle 1 Litre", 399, 899, "Stainless steel", "Blue"],
  ]],
  [/clean|mop|laundry/i, [
    ["Spin Mop with Bucket and 2 Refills", 999, 2199, "Plastic", "Blue"],
    ["Microfibre Cleaning Cloths, Pack of 6", 199, 499, "Microfibre", "Assorted"],
    ["Toilet Brush with Holder", 179, 399, "Plastic", "White"],
    ["Kitchen Sink Scrub Pads, Pack of 10", 129, 299, "Sponge", "Yellow"],
    ["Dustpan and Broom Set, Long Handle", 349, 799, "Plastic", "Grey"],
    ["Window Cleaning Wiper 2-in-1", 229, 549, "Plastic", "Green"],
    ["Foldable Laundry Basket 60 L", 449, 999, "Fabric", "Beige"],
    ["Lint Roller with 3 Refills", 159, 349, "Plastic", "Black"],
  ]],
  [/decor|d[ée]cor|light|lamp/i, [
    ["Ceramic Flower Vase, Matte Finish", 399, 899, "Ceramic", "White"],
    ["Macrame Wall Hanging, Boho", 449, 999, "Cotton", "Cream"],
    ["Brass Diya Set of 4", 299, 699, "Brass", "Gold"],
    ["LED Fairy String Lights 10 m", 249, 599, "Copper wire", "Warm white"],
    ["Wooden Wall Clock 12 inch", 699, 1499, "MDF", "Brown"],
    ["Cushion Covers, Set of 5 (16x16)", 499, 1199, "Cotton", "Mustard"],
    ["Artificial Money Plant with Pot", 349, 799, "Plastic", "Green"],
    ["Photo Frame Collage, 6 Photos", 599, 1299, "Wood", "Black"],
  ]],
  [/storage|organis|organiz/i, [
    ["Stackable Fridge Organiser Boxes, Set of 4", 499, 1099, "Plastic", "Clear"],
    ["Under-Bed Storage Bag 2-Pack", 399, 899, "Non-woven fabric", "Grey"],
    ["3-Tier Kitchen Trolley with Wheels", 899, 1999, "Metal", "White"],
    ["Shoe Rack, 4 Shelves", 749, 1599, "Metal and fabric", "Black"],
    ["Drawer Divider Organisers, Set of 6", 299, 699, "Plastic", "White"],
    ["Wall Mounted Spice Rack", 349, 799, "Metal", "Black"],
    ["Wardrobe Organiser, 6 Compartments", 449, 999, "Fabric", "Beige"],
    ["Cable Organiser Box", 299, 649, "Plastic", "White"],
  ]],
  [/bath/i, [
    ["Bath Mat, Anti-Slip Microfibre", 299, 699, "Microfibre", "Grey"],
    ["Toothbrush Holder, Wall Mounted", 199, 449, "Plastic", "White"],
    ["Corner Shower Caddy, 2 Tier", 449, 999, "Stainless steel", "Silver"],
    ["Soap Dispenser 350 ml, Set of 2", 349, 799, "Ceramic", "White"],
    ["Bathroom Towel Rack 24 inch", 549, 1199, "Stainless steel", "Silver"],
    ["Cotton Bath Towel, 500 GSM", 399, 899, "Cotton", "Blue"],
    ["Shower Curtain with Hooks", 349, 749, "Polyester", "White"],
    ["Bathroom Mirror Cabinet", 1299, 2799, "MDF", "White"],
  ]],
  [/kid|fashion|cloth|wear|apparel/i, [
    ["Boys Cotton T-Shirt and Shorts Set", 299, 699, "Cotton", "Navy"],
    ["Girls Printed Frock, Sleeveless", 349, 799, "Cotton", "Pink"],
    ["Kids Hooded Sweatshirt", 449, 999, "Fleece", "Grey"],
    ["Baby Romper, Pack of 2", 399, 899, "Cotton", "Yellow"],
    ["Kids Pyjama Set, Full Sleeves", 379, 849, "Cotton", "Blue"],
    ["Girls Leggings, Pack of 3", 349, 749, "Cotton lycra", "Assorted"],
    ["Boys Denim Jeans, Slim Fit", 499, 1099, "Denim", "Blue"],
    ["Kids Winter Jacket", 799, 1799, "Polyester", "Red"],
  ]],
  [/toy|game/i, [
    ["Building Blocks Set, 120 Pieces", 449, 999, "ABS plastic", "Multicolour"],
    ["Soft Teddy Bear 30 cm", 349, 799, "Plush", "Brown"],
    ["Wooden Puzzle, Animals", 249, 599, "Wood", "Multicolour"],
    ["Remote Control Car", 799, 1799, "Plastic", "Red"],
    ["Kids Drawing Kit, 42 Pieces", 399, 899, "Mixed", "Multicolour"],
    ["Musical Keyboard for Kids", 699, 1499, "Plastic", "Blue"],
    ["Stacking Rings Toy", 199, 449, "Plastic", "Multicolour"],
    ["Board Game, Snakes and Ladders", 249, 549, "Cardboard", "Multicolour"],
  ]],
  [/.*/, [
    ["Multipurpose Hooks, Pack of 10", 149, 349, "Plastic", "White"],
    ["Door Draft Stopper", 249, 599, "Fabric", "Grey"],
    ["Rechargeable LED Torch", 399, 899, "ABS plastic", "Black"],
    ["Extension Board, 4 Sockets", 449, 999, "Polycarbonate", "White"],
    ["Mosquito Net, Foldable", 499, 1099, "Polyester", "White"],
    ["Digital Kitchen Weighing Scale", 349, 799, "Plastic", "Black"],
    ["Umbrella, Auto Open", 399, 899, "Polyester", "Black"],
    ["First Aid Box, Empty", 249, 549, "Plastic", "Red"],
  ]],
];

const ADULT = ["S", "M", "L", "XL"];
const KIDS = ["1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

type Cat = { id: string; slug: string; name: string; parent_id: string | null; has_sizes?: boolean };

async function remove() {
  const { count } = await db.from("products").select("id", { count: "exact", head: true }).eq("is_demo", true);
  if (DRY) return console.log(`Would delete ${count ?? 0} sample products.`);
  // Sample products are never in orders (the database refuses that), so they can always be deleted.
  const { error } = await db.from("products").delete().eq("is_demo", true);
  if (error) throw new Error(`Deleting sample products: ${error.message}`);
  console.log(`Deleted ${count ?? 0} sample products. Remember to refresh the shop (Admin → Homepage → Save changes).`);
}

async function add() {
  const probe = await db.from("products").select("is_demo").limit(1);
  if (probe.error) throw new Error("Run supabase/migrations/0013_demo_products.sql in the Supabase SQL Editor first.");

  const { data: cats, error: cErr } = await db.from("categories").select("id, slug, name, parent_id, has_sizes").order("sort_order");
  if (cErr) throw new Error(`Reading categories: ${cErr.message}`);
  const all = cats as Cat[];
  const tops = all.filter((c) => !c.parent_id);

  // Your own product photos, grouped by main category (reused for the samples).
  const { data: photos, error: pErr } = await db.from("product_images").select("src, alt, products!inner(category_id, is_demo)").eq("products.is_demo", false);
  if (pErr) throw new Error(`Reading photos: ${pErr.message}`);
  const byCat = new Map<string, string[]>();
  const anyPhoto: string[] = [];
  for (const p of photos as unknown as { src: string; products: { category_id: string } }[]) {
    anyPhoto.push(p.src);
    byCat.set(p.products.category_id, [...(byCat.get(p.products.category_id) ?? []), p.src]);
  }
  if (anyPhoto.length === 0) throw new Error("Add at least one real product with a photo first (samples reuse your photos).");

  const { data: existing } = await db.from("products").select("slug");
  const taken = new Set((existing ?? []).map((r: { slug: string }) => r.slug));

  let added = 0;
  for (const top of tops) {
    const items = CATALOGUE.find(([re]) => re.test(top.name))![1];
    const subs = all.filter((c) => c.parent_id === top.id);
    const pics = byCat.get(top.id)?.length ? byCat.get(top.id)! : anyPhoto;
    const rows = items
      .map(([title, price, mrp, material, colour], i) => {
        const sub = subs.length ? subs[i % subs.length]! : null;
        const clothing = Boolean(top.has_sizes || sub?.has_sizes);
        const slug = slugify(`${title}-${top.slug}`);
        if (taken.has(slug)) return null;
        taken.add(slug);
        return {
          row: {
            slug,
            category_id: top.id,
            subcategory_id: sub?.id ?? null,
            title,
            summary: `${title} in ${colour.toLowerCase()} ${material.toLowerCase()}. Sample product shown for design preview.`,
            description: `${title}. Made of ${material.toLowerCase()} in ${colour.toLowerCase()}.\n\nThis is a sample product used to preview the shop and is not for sale yet.`,
            how_to_use: ["Unbox and check all parts.", "Wipe with a clean, dry cloth before first use."],
            specs: [
              { label: "Material", value: material },
              { label: "Colour", value: colour },
              { label: "Country of origin", value: "India" },
            ],
            material,
            colour,
            sizes: clothing ? (/kid|baby|boy|girl/i.test(`${top.name} ${sub?.name ?? ""}`) ? KIDS : ADULT) : [],
            price,
            mrp,
            meesho_price: Math.round(price * 0.6),
            stock: 25,
            is_bestseller: i % 4 === 0,
            is_flash_sale: i % 3 === 1,
            is_new: i % 5 === 2 ? true : null,
            is_active: true,
            is_demo: true,
            faqs: [],
          },
          images: [0, 1].map((k) => pics[(i * 2 + k) % pics.length]!).filter((v, k, a) => a.indexOf(v) === k),
        };
      })
      .filter((x) => x !== null);

    console.log(`${DRY ? "would add" : "adding"} ${String(rows.length).padStart(3)}  ${top.name}`);
    if (DRY || rows.length === 0) continue;
    const { data: inserted, error } = await db.from("products").insert(rows.map((r) => r.row)).select("id, slug");
    if (error) throw new Error(`Adding samples to ${top.name}: ${error.message}`);
    const idBySlug = new Map((inserted as { id: string; slug: string }[]).map((r) => [r.slug, r.id]));
    const imgs = rows.flatMap((r) => r.images.map((src, k) => ({ product_id: idBySlug.get(r.row.slug)!, src, alt: r.row.title, sort_order: k })));
    const { error: iErr } = await db.from("product_images").insert(imgs);
    if (iErr) throw new Error(`Adding sample photos: ${iErr.message}`);
    added += rows.length;
  }
  console.log(DRY ? "\nDry run: nothing changed." : `\nAdded ${added} sample products. Refresh the shop: Admin → Homepage → Save changes.`);
}

(REMOVE ? remove() : add()).catch((e) => {
  console.error(`\nStopped: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
