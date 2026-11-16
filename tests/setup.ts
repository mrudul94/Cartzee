import { store } from "@/lib/data/seed-store";
import { testCategories, testPosts, testProducts, testReviews } from "./fixtures/catalogue";

/** Mock mode starts empty; load the small test catalogue into the in-memory store for every test file. */
if (store.products.length === 0) {
  store.categories.push(...testCategories.map((c) => ({ ...c, faqs: [...c.faqs], isActive: true })));
  store.products.push(...testProducts.map((p) => ({ ...p, images: [...p.images], isActive: true })));
  store.posts.push(...testPosts.map((p) => ({ ...p, isPublished: true })));
  store.reviews.push(...testReviews.map((r) => ({ ...r, isApproved: true })));
}
