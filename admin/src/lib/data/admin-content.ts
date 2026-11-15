import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import type { Category, Faq, Post, PostBlock, Review } from "@/lib/types";
import { paths } from "@/lib/utils/paths";
import { AdminError } from "./admin-repo";
import { store } from "@/lib/data/seed-store";
import { fail, UUID } from "@/lib/data/supabase-repo";
import { svc } from "@/lib/data/supabase-clients";

/* ==================================================================== types */

export type AdminCategory = Category & { isActive: boolean; productCount: number; childCount: number };
export type CategoryInput = {
  id?: string;
  slug: string;
  name: string;
  parentSlug: string | null;
  intro: string;
  blurb: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  faqs: Faq[];
};

export type AdminPost = Post & { isPublished: boolean };
export type PostInput = Omit<Post, "publishedAt" | "updatedAt"> & { originalSlug?: string; isPublished: boolean };

export type AdminReview = Review & { isApproved: boolean; productTitle: string; productPath: string };

/** Categories, buying guides and reviews: the parts of the CMS that live in their own tables. */
export interface ContentAdmin {
  listCategories(): Promise<AdminCategory[]>;
  saveCategory(input: CategoryInput): Promise<AdminCategory>;
  deleteCategory(id: string): Promise<void>;
  listPosts(): Promise<AdminPost[]>;
  getPost(slug: string): Promise<AdminPost | null>;
  savePost(input: PostInput): Promise<AdminPost>;
  deletePost(slug: string): Promise<void>;
  listReviews(): Promise<AdminReview[]>;
  setReviewApproved(id: string, approved: boolean): Promise<void>;
  deleteReview(id: string): Promise<void>;
}

function checkParent(input: CategoryInput, cats: { id: string; slug: string; parentSlug: string | null }[]) {
  if (!input.parentSlug) return;
  const parent = cats.find((c) => c.slug === input.parentSlug);
  if (!parent || parent.parentSlug) throw new AdminError("Parent must be a top-level category");
  if (input.id && parent.id === input.id) throw new AdminError("A category can't be its own parent");
}

const deleteGuard = (c: { name: string; productCount: number; childCount: number }) => {
  if (c.productCount > 0) throw new AdminError(`"${c.name}" still has ${c.productCount} product(s). Move them or hide the category instead.`);
  if (c.childCount > 0) throw new AdminError(`"${c.name}" still has ${c.childCount} subcategories. Delete or move those first.`);
};

/* ==================================================================== seed (mock mode) */

const seedContent: ContentAdmin = {
  async listCategories() {
    return store.categories
      .map((c) => ({
        ...c,
        productCount: store.products.filter((p) => p.categorySlug === c.slug || p.subcategorySlug === c.slug).length,
        childCount: store.categories.filter((x) => x.parentSlug === c.slug).length,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async saveCategory(input) {
    checkParent(input, store.categories);
    if (store.categories.some((c) => c.slug === input.slug && c.id !== input.id)) throw new AdminError(`The URL slug "${input.slug}" is already used`);
    const existing = input.id ? store.categories.find((c) => c.id === input.id) : undefined;
    if (input.id && !existing) throw new AdminError("Category not found");
    const { id: _id, ...fields } = input;
    if (existing) {
      const oldSlug = existing.slug;
      Object.assign(existing, fields, { blurb: input.blurb || input.intro });
      // Products and subcategories reference slugs in mock mode; keep them attached.
      if (oldSlug !== input.slug) {
        store.products.forEach((p) => {
          if (p.categorySlug === oldSlug) p.categorySlug = input.slug;
          if (p.subcategorySlug === oldSlug) p.subcategorySlug = input.slug;
        });
        store.categories.forEach((c) => c.parentSlug === oldSlug && (c.parentSlug = input.slug));
      }
    } else {
      store.categories.push({ ...fields, id: `cat_${Date.now().toString(36)}`, blurb: input.blurb || input.intro });
    }
    return (await seedContent.listCategories()).find((c) => c.slug === input.slug)!;
  },
  async deleteCategory(id) {
    const c = (await seedContent.listCategories()).find((x) => x.id === id);
    if (!c) throw new AdminError("Category not found");
    deleteGuard(c);
    store.categories = store.categories.filter((x) => x.id !== id);
  },
  async listPosts() {
    return [...store.posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  async getPost(slug) {
    return store.posts.find((p) => p.slug === slug) ?? null;
  },
  async savePost(input) {
    const key = input.originalSlug ?? input.slug;
    if (store.posts.some((p) => p.slug === input.slug && p.slug !== key)) throw new AdminError(`The URL slug "${input.slug}" is already used`);
    const existing = input.originalSlug ? store.posts.find((p) => p.slug === input.originalSlug) : undefined;
    const now = new Date().toISOString().slice(0, 10);
    const { originalSlug: _o, ...fields } = input;
    const post: AdminPost = { ...fields, publishedAt: existing?.publishedAt ?? now, updatedAt: now };
    if (existing) Object.assign(existing, post);
    else store.posts.push(post);
    return post;
  },
  async deletePost(slug) {
    store.posts = store.posts.filter((p) => p.slug !== slug);
  },
  async listReviews() {
    return store.reviews
      .map((r) => {
        const p = store.products.find((x) => x.id === r.productId);
        return { ...r, productTitle: p?.title ?? "Deleted product", productPath: p ? paths.product(p) : "" };
      })
      .sort((a, b) => Number(a.isApproved) - Number(b.isApproved) || b.createdAt.localeCompare(a.createdAt));
  },
  async setReviewApproved(id, approved) {
    const r = store.reviews.find((x) => x.id === id);
    if (!r) throw new AdminError("Review not found");
    r.isApproved = approved;
  },
  async deleteReview(id) {
    store.reviews = store.reviews.filter((r) => r.id !== id);
  },
};

/* ==================================================================== supabase */

type CategoryRow = {
  id: string; slug: string; name: string; parent_id: string | null; intro: string; blurb: string; image: string; sort_order: number;
  seo_title: string | null; seo_description: string | null; faqs: Faq[]; is_active: boolean;
};
type PostRow = {
  id: string; slug: string; title: string; excerpt: string; body: PostBlock[]; faqs: Faq[]; cover: string; author: string;
  is_published: boolean; published_at: string | null; updated_at: string;
};

const toPost = (r: PostRow): AdminPost => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  body: r.body ?? [],
  faqs: r.faqs ?? [],
  cover: r.cover,
  author: r.author,
  isPublished: r.is_published,
  publishedAt: (r.published_at ?? r.updated_at).slice(0, 10),
  updatedAt: r.updated_at.slice(0, 10),
});

const supabaseContent: ContentAdmin = {
  async listCategories() {
    const [cats, prods] = await Promise.all([
      svc().from("categories").select("*").order("sort_order"),
      svc().from("products").select("category_id, subcategory_id"),
    ]);
    if (cats.error) fail("admin categories", cats.error);
    if (prods.error) fail("category product counts", prods.error);
    const rows = cats.data as CategoryRow[];
    const slugById = new Map(rows.map((r) => [r.id, r.slug]));
    const productRows = prods.data as { category_id: string; subcategory_id: string }[];
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      parentSlug: r.parent_id ? (slugById.get(r.parent_id) ?? null) : null,
      intro: r.intro,
      blurb: r.blurb,
      image: r.image,
      sortOrder: r.sort_order,
      seoTitle: r.seo_title ?? undefined,
      seoDescription: r.seo_description ?? undefined,
      faqs: r.faqs ?? [],
      isActive: r.is_active,
      productCount: productRows.filter((p) => p.category_id === r.id || p.subcategory_id === r.id).length,
      childCount: rows.filter((x) => x.parent_id === r.id).length,
    }));
  },
  async saveCategory(input) {
    const all = await supabaseContent.listCategories();
    checkParent(input, all);
    const parent = input.parentSlug ? all.find((c) => c.slug === input.parentSlug) : undefined;
    const row = {
      slug: input.slug,
      name: input.name,
      parent_id: parent?.id ?? null,
      intro: input.intro,
      blurb: input.blurb || input.intro,
      image: input.image,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      faqs: input.faqs,
    };
    const res = input.id ? await svc().from("categories").update(row).eq("id", input.id) : await svc().from("categories").insert(row);
    if (res.error) {
      if (res.error.code === "23505") throw new AdminError(`The URL slug "${input.slug}" is already used`);
      fail("save category", res.error);
    }
    return (await supabaseContent.listCategories()).find((c) => c.slug === input.slug)!;
  },
  async deleteCategory(id) {
    const c = (await supabaseContent.listCategories()).find((x) => x.id === id);
    if (!c) throw new AdminError("Category not found");
    deleteGuard(c);
    const { error } = await svc().from("categories").delete().eq("id", id);
    if (error) fail("delete category", error);
  },
  async listPosts() {
    const { data, error } = await svc().from("blog_posts").select("*").order("published_at", { ascending: false, nullsFirst: true });
    if (error) fail("admin posts", error);
    return (data as PostRow[]).map(toPost);
  },
  async getPost(slug) {
    const { data, error } = await svc().from("blog_posts").select("*").eq("slug", slug).maybeSingle();
    if (error) fail("admin post", error);
    return data ? toPost(data as PostRow) : null;
  },
  async savePost(input) {
    const row = {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      faqs: input.faqs,
      cover: input.cover,
      author: input.author,
      is_published: input.isPublished,
    };
    const existing = input.originalSlug ? await supabaseContent.getPost(input.originalSlug) : null;
    const res = existing
      ? await svc()
          .from("blog_posts")
          .update({ ...row, published_at: input.isPublished && !existing.isPublished ? new Date().toISOString() : undefined })
          .eq("slug", input.originalSlug!)
      : await svc().from("blog_posts").insert({ ...row, published_at: input.isPublished ? new Date().toISOString() : null });
    if (res.error) {
      if (res.error.code === "23505") throw new AdminError(`The URL slug "${input.slug}" is already used`);
      fail("save post", res.error);
    }
    return (await supabaseContent.getPost(input.slug))!;
  },
  async deletePost(slug) {
    const { error } = await svc().from("blog_posts").delete().eq("slug", slug);
    if (error) fail("delete post", error);
  },
  async listReviews() {
    const { data, error } = await svc()
      .from("reviews")
      .select("*, products(title, slug, category_id, subcategory_id)")
      .order("is_approved")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) fail("admin reviews", error);
    const cats = await supabaseContent.listCategories();
    const slugOf = (id: string) => cats.find((c) => c.id === id)?.slug ?? "";
    type Row = { id: string; product_id: string; author: string; city: string; rating: number; title: string; body: string; photos: string[]; verified: boolean; is_approved: boolean; created_at: string; products: { title: string; slug: string; category_id: string; subcategory_id: string } | null };
    return (data as Row[]).map((r) => ({
      id: r.id,
      productId: r.product_id,
      author: r.author,
      city: r.city,
      rating: r.rating,
      title: r.title,
      body: r.body,
      photos: r.photos ?? [],
      verified: r.verified,
      createdAt: r.created_at,
      isApproved: r.is_approved,
      productTitle: r.products?.title ?? "Deleted product",
      productPath: r.products ? paths.product({ categorySlug: slugOf(r.products.category_id), subcategorySlug: slugOf(r.products.subcategory_id), slug: r.products.slug }) : "",
    }));
  },
  async setReviewApproved(id, approved) {
    if (!UUID.test(id)) throw new AdminError("Review not found");
    const { error } = await svc().from("reviews").update({ is_approved: approved }).eq("id", id);
    if (error) fail("approve review", error);
  },
  async deleteReview(id) {
    if (!UUID.test(id)) throw new AdminError("Review not found");
    const { error } = await svc().from("reviews").delete().eq("id", id);
    if (error) fail("delete review", error);
  },
};

export const contentAdmin: ContentAdmin = isSupabaseConfigured ? supabaseContent : seedContent;
