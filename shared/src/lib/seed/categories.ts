import type { Category } from "@/lib/types";

/**
 * Seed catalogue structure. In production this comes from the `categories` table
 * (top-level rows have parent_slug = null). Copy is original to City Seller.
 */
type Seed = Omit<Category, "id" | "image" | "sortOrder" | "faqs" | "blurb"> &
  Partial<Pick<Category, "faqs" | "blurb">>;

const top: Seed[] = [
  {
    slug: "kitchen",
    name: "Kitchen & Dining",
    parentSlug: null,
    intro:
      "Kitchen & Dining at City Seller covers airtight containers, cookware and handy prep tools for Indian kitchens. Everything is chosen for daily use, easy cleaning and honest prices.",
    blurb: "Airtight jars, tawas and choppers that keep your kitchen tidy and cooking quick.",
    seoTitle: "Kitchen & Dining Essentials Online at Best Prices",
    faqs: [
      { q: "Are your kitchen containers food-safe?", a: "Yes. Every container we list is made from food-grade, BPA-free plastic, glass or stainless steel, as mentioned in its specifications table." },
      { q: "Can I use non-stick cookware on induction?", a: "Only if the product page says \"induction base\". Our tawas and pans list their compatible stovetops in the specs." },
      { q: "How long does kitchen product delivery take?", a: "Most PIN codes receive orders in 4 to 8 days. Enter your PIN code on any product page for an estimate." },
    ],
  },
  {
    slug: "storage",
    name: "Storage & Organisation",
    parentSlug: null,
    intro:
      "Storage & Organisation products help you fit more into small Indian homes, from foldable wardrobe boxes to multi-tier racks. They suit rented flats, hostels and family homes alike.",
    blurb: "Wardrobe organisers, saree covers and racks that make every shelf count.",
    faqs: [
      { q: "Do the racks need drilling?", a: "Free-standing racks need no drilling. Wall-mounted items say so clearly in their specifications." },
      { q: "Will the wardrobe boxes fit my almirah shelf?", a: "Check the dimensions row in the specs table and measure your shelf depth; most of our boxes suit standard 45 cm deep shelves." },
      { q: "Are the fabric organisers washable?", a: "Wipe them with a damp cloth. Machine washing can weaken the stiffening boards." },
    ],
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    parentSlug: null,
    intro:
      "Cleaning essentials at City Seller include spin mops, brooms, microfibre cloths and scrubbers that make daily jhadu-pocha faster. They are built for Indian floors, tiles and kitchens.",
    blurb: "Spin mops, soft brooms and microfibre cloths for faster daily cleaning.",
    faqs: [
      { q: "Are spin mop refills available separately?", a: "Yes. Search for mop refills or contact customer care with your order number." },
      { q: "Can microfibre cloths be machine washed?", a: "Yes, wash them warm without fabric softener so they keep absorbing well." },
      { q: "Which mop is best for marble floors?", a: "A microfibre spin mop with a well-wrung head is gentle on marble and leaves less water behind." },
    ],
  },
  {
    slug: "bathroom",
    name: "Bathroom",
    parentSlug: null,
    intro:
      "Bathroom products at City Seller include rust-proof shelves, soap dispensers and anti-slip mats for safer, tidier bathrooms. Most install without drilling.",
    blurb: "No-drill shelves, dispensers and anti-slip mats for safer bathrooms.",
    faqs: [
      { q: "Will adhesive shelves hold on bathroom tiles?", a: "Yes, on smooth, dry, clean tiles. Leave the adhesive to set for 24 hours before loading the shelf." },
      { q: "Are the shelves rust-proof?", a: "Our bathroom shelves are aluminium or stainless steel, which resist rust in humid bathrooms." },
      { q: "Can bath mats be machine washed?", a: "Most can on a gentle cycle. Check the care row in each product's specifications." },
    ],
  },
  {
    slug: "home-decor",
    name: "Home Décor",
    parentSlug: null,
    intro:
      "Home Décor at City Seller brings handmade wall hangings, ceramic vases and warm lighting that make a room feel finished without a big budget.",
    blurb: "Macramé, ceramic vases and fairy lights for a warm, lived-in look.",
    faqs: [
      { q: "Are the décor items handmade?", a: "Items marked handmade are crafted by small workshops, so small variations in knots, glaze or shade are normal." },
      { q: "Are LED string lights safe for indoor use?", a: "Yes. They run on low voltage and stay cool to the touch." },
      { q: "Do vases hold water?", a: "Glazed ceramic vases hold water. Unglazed or decorative ones say \"dry flowers only\" in their specs." },
    ],
  },
  {
    slug: "home-improvement",
    name: "Home Improvement",
    parentSlug: null,
    intro:
      "Home Improvement covers small fixes like adhesive hooks and door draft stoppers that you can install yourself in minutes, with no tools or drilling.",
    blurb: "No-drill hooks and quick fixes you can install in minutes.",
    faqs: [
      { q: "How much weight can adhesive hooks hold?", a: "Each product lists its tested load in the specs. Stay below it and wait 24 hours before hanging anything." },
      { q: "Do these work on painted walls?", a: "They work best on smooth tiles, glass, metal and gloss paint. Textured or matte walls reduce grip." },
      { q: "Can I remove hooks without damaging the wall?", a: "Warm the adhesive with a hair dryer for a minute and peel slowly." },
    ],
  },
];

const sub: Seed[] = [
  { slug: "storage-containers", name: "Storage Containers", parentSlug: "kitchen", intro: "Airtight jars and containers that keep dal, atta, snacks and spices fresh for longer." },
  { slug: "cookware", name: "Cookware", parentSlug: "kitchen", intro: "Tawas and pans for everyday rotis, dosas and sabzis, made for Indian cooking." },
  { slug: "kitchen-tools", name: "Kitchen Tools", parentSlug: "kitchen", intro: "Choppers and prep tools that save time on daily cutting and cooking." },
  { slug: "wardrobe-organisers", name: "Wardrobe Organisers", parentSlug: "storage", intro: "Foldable boxes and covers that keep clothes, sarees and bedding neat and dust-free." },
  { slug: "shelves-racks", name: "Shelves & Racks", parentSlug: "storage", intro: "Free-standing racks and under-sink organisers that add storage without drilling." },
  { slug: "mops-brooms", name: "Mops & Brooms", parentSlug: "cleaning", intro: "Spin mops and soft brooms for quick daily floor cleaning." },
  { slug: "cleaning-tools", name: "Cleaning Tools", parentSlug: "cleaning", intro: "Cloths and scrubbers for kitchens, glass and bathrooms." },
  { slug: "bath-storage", name: "Bath Storage", parentSlug: "bathroom", intro: "Rust-proof, no-drill shelves that keep toiletries organised." },
  { slug: "bath-accessories", name: "Bath Accessories", parentSlug: "bathroom", intro: "Dispensers and anti-slip mats for safer, tidier bathrooms." },
  { slug: "wall-decor", name: "Wall Décor", parentSlug: "home-decor", intro: "Handmade wall hangings that add texture to bare walls." },
  { slug: "vases-planters", name: "Vases & Planters", parentSlug: "home-decor", intro: "Ceramic vases for fresh or dried flowers." },
  { slug: "lighting", name: "Lighting", parentSlug: "home-decor", intro: "Warm LED string lights for festivals, balconies and bedrooms." },
  { slug: "hooks-hardware", name: "Hooks & Hardware", parentSlug: "home-improvement", intro: "Adhesive hooks and holders that install without drilling." },
  { slug: "door-window", name: "Door & Window", parentSlug: "home-improvement", intro: "Draft stoppers and seals that keep out dust, insects and drafts." },
];

export const seedCategories: Category[] = [...top, ...sub].map((c, i) => ({
  ...c,
  id: `cat_${String(i + 1).padStart(2, "0")}`,
  image: `/placeholders/categories/${c.slug}.svg`,
  sortOrder: i,
  blurb: c.blurb ?? c.intro,
  faqs: c.faqs ?? [],
}));
