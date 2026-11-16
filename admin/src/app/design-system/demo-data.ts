import type { Category, Post, Product, Review } from "@/lib/types";

/**
 * Generic example records for the admin style guide only (component previews). They are never
 * shown on the shop and never written to the database. Images use the City Seller logo files.
 */
const IMG = "/logo/mark.png";
const now = new Date().toISOString();

export const demoCategories: Category[] = [
  { id: "cat_demo", slug: "example-category", name: "Example category", parentSlug: null, intro: "A short answer that introduces the category.", blurb: "One line about the category.", image: IMG, sortOrder: 1, faqs: [{ q: "Example question?", a: "Example answer." }] },
  { id: "cat_demo_sub", slug: "example-subcategory", name: "Example subcategory", parentSlug: "example-category", intro: "A short answer that introduces the subcategory.", blurb: "", image: IMG, sortOrder: 1, faqs: [] },
];

const product = (n: number, extra: Partial<Product> = {}): Product => ({
  id: `prd_demo_${n}`,
  slug: `example-product-${n}`,
  categorySlug: "example-category",
  subcategorySlug: "example-subcategory",
  title: `Example product ${n}`,
  summary: "A one-line summary of what the product is and who it is for.",
  description: "A longer description of the product.",
  howToUse: ["First step", "Second step"],
  specs: [
    { label: "Material", value: "Example material" },
    { label: "Size", value: "10 x 10 x 10 cm" },
    { label: "Pack contains", value: "1 piece" },
  ],
  material: "Example material",
  colour: "Example colour",
  price: 299 + n * 100,
  mrp: 599 + n * 200,
  meeshoUrl: "https://www.meesho.com/example",
  meeshoPrice: 150 + n * 50,
  priceCheckedAt: now,
  rating: 4.2,
  reviewCount: 12,
  stock: 10,
  isBestseller: n === 1,
  isFlashSale: n === 2,
  images: [
    { src: IMG, alt: `Example product ${n}, front view` },
    { src: IMG, alt: `Example product ${n}, side view` },
  ],
  faqs: [{ q: "Example question?", a: "Example answer." }],
  createdAt: now,
  ...extra,
});

export const demoProducts: Product[] = [product(1), product(2), product(3, { stock: 0 }), product(4)];

export const demoReviews: Review[] = [
  { id: "rev_demo", productId: "prd_demo_1", author: "Example buyer", city: "Pune", rating: 5, title: "Example review title", body: "Example review text.", photos: [], createdAt: now, verified: true },
];

export const demoPosts: Post[] = [
  {
    slug: "example-guide",
    title: "Example buying guide",
    excerpt: "A short summary of the guide.",
    body: [{ type: "p", text: "Example paragraph." }],
    faqs: [],
    cover: IMG,
    author: "City Seller Team",
    publishedAt: now,
    updatedAt: now,
  },
];
