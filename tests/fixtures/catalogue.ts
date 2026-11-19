import type { Category, Post, Product, Review } from "@/lib/types";

/**
 * Minimal catalogue used ONLY by the automated tests (loaded into the in-memory store and into
 * the PGlite test database). It is never part of either website.
 * Prices/stock are chosen to exercise checkout rules (free-shipping threshold, out of stock…).
 */
const cat = (slug: string, name: string, parentSlug: string | null, sortOrder: number): Category => ({
  id: `cat_${slug}`,
  slug,
  name,
  parentSlug,
  intro: `${name} test category intro, long enough to read like a real answer sentence.`,
  blurb: `${name} test blurb.`,
  image: "/logo/mark.png",
  sortOrder,
  faqs: [],
});

export const testCategories: Category[] = [
  cat("kitchen", "Kitchen & Dining", null, 1),
  cat("cleaning", "Cleaning", null, 2),
  cat("bathroom", "Bathroom", null, 3),
  cat("home-decor", "Home Décor", null, 4),
  cat("door-window", "Door & Window", null, 5),
  cat("storage-containers", "Storage Containers", "kitchen", 1),
  cat("kitchen-tools", "Kitchen Tools", "kitchen", 2),
  cat("mops-brooms", "Mops & Brooms", "cleaning", 1),
  cat("bath-storage", "Bath Storage", "bathroom", 1),
  cat("vases-planters", "Vases & Planters", "home-decor", 1),
  cat("draft-stoppers", "Draft Stoppers", "door-window", 1),
];

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const product = (
  id: string,
  slug: string,
  title: string,
  categorySlug: string,
  subcategorySlug: string,
  price: number,
  mrp: number,
  meeshoPrice: number,
  extra: Partial<Product> = {},
): Product => ({
  id,
  slug,
  categorySlug,
  subcategorySlug,
  title,
  summary: `${title}: test product summary.`,
  description: `${title}: test product description.`,
  howToUse: ["Test step"],
  specs: [{ label: "Material", value: "Test" }],
  material: "Plastic",
  colour: "White",
  price,
  mrp,
  meeshoUrl: `https://www.meesho.com/${slug}`,
  meeshoPrice,
  priceCheckedAt: daysAgo(1),
  rating: 4.2,
  reviewCount: 10,
  stock: 50,
  isBestseller: false,
  isFlashSale: false,
  images: [{ src: "/logo/mark.png", alt: `${title} front view` }],
  faqs: [],
  createdAt: daysAgo(90),
  ...extra,
});

export const testProducts: Product[] = [
  product("prd_001", "airtight-jar-set-6pc", "Airtight Storage Jar Set, 6 pc", "kitchen", "storage-containers", 449, 899, 260, { isBestseller: true }),
  product("prd_002", "spin-mop-bucket-set", "Spin Mop with Bucket", "cleaning", "mops-brooms", 799, 1499, 470),
  product("prd_003", "bath-corner-shelf", "No-Drill Bathroom Corner Shelf", "bathroom", "bath-storage", 349, 699, 190),
  product("prd_004", "ceramic-vase-set-3pc", "Ceramic Vase Set, 3 pc", "home-decor", "vases-planters", 299, 599, 150, { isFlashSale: true }),
  product("prd_008", "vegetable-chopper-900ml", "Pull-Cord Vegetable Chopper", "kitchen", "kitchen-tools", 299, 599, 165, { stock: 0 }),
  product("prd_010", "door-draft-stopper-90cm", "Door Draft Stopper, 90 cm", "door-window", "draft-stoppers", 249, 499, 120, { priceCheckedAt: daysAgo(20) }),
  product("prd_011", "microfibre-cloth-pack", "Microfibre Cleaning Cloths, Pack of 10", "cleaning", "mops-brooms", 199, 399, 90),
];

export const testReviews: Review[] = [
  { id: "rev_001", productId: "prd_001", author: "Test Buyer", city: "Pune", rating: 5, title: "Works well", body: "Test review.", photos: [], createdAt: daysAgo(10), verified: true },
];

export const testPosts: Post[] = [
  {
    slug: "test-guide",
    title: "Test buying guide",
    excerpt: "A short test guide.",
    body: [{ type: "p", text: "Test paragraph." }, { type: "products", slugs: ["airtight-jar-set-6pc"] }],
    faqs: [],
    cover: "/logo/mark.png",
    author: "Cartzee Team",
    publishedAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
];
