import { buildCategoryTree } from "@/components/layout/MegaMenu";
import { PAGE_SLUGS } from "@/lib/content/schema";
import { repo } from "@/lib/data";
import { getPage, getSettings, getStoreFaqs } from "@/lib/data/content-repo";
import { site } from "@/lib/site";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;

const abs = (p: string) => `${site.url}${p}`;

/**
 * /llms.txt (llmstxt.org): a plain-Markdown map of the store for AI assistants and answer engines,
 * generated from the live catalogue and CMS content so it never goes stale.
 */
export async function GET() {
  const [categories, products, posts, settings, faqs, pages] = await Promise.all([
    repo.listCategories(),
    repo.listProducts(),
    repo.listPosts(),
    getSettings(),
    getStoreFaqs(),
    Promise.all(PAGE_SLUGS.map((s) => getPage(s))),
  ]);
  const tree = buildCategoryTree(categories);
  const bestsellers = products.filter((p) => p.isBestseller);
  const about = pages.find((p) => p.slug === "about");
  const policyPages = pages.filter((p) => p.slug !== "about");
  const { delivery, care } = settings;

  const lines = [
    `# ${site.name}`,
    "",
    `> ${about?.answer ?? site.description}`,
    "",
    `- Ships to all Indian PIN codes, usually in 4 to 8 days. Free delivery above ${formatINR(delivery.freeAbove)}, otherwise ${formatINR(delivery.fee)}.`,
    "- Prepaid orders only (UPI, credit/debit cards, netbanking via Razorpay). No Cash on Delivery.",
    `- Damaged, defective or wrong items can be reported within ${delivery.returnWindowDays} days of delivery for a replacement or full refund.`,
    `- Prices are in Indian Rupees and include taxes. ${products.length} products across ${tree.length} categories.`,
    "",
    "## Categories",
    ...tree.flatMap((c) => [
      `- [${c.name}](${abs(paths.category(c))}): ${c.intro}`,
      ...c.children.map((s) => `  - [${s.name}](${abs(paths.category(s))}): ${s.intro}`),
    ]),
    "",
    "## Shop by budget",
    ...BUDGET_TIERS.map((t) => `- [${t.label}](${abs(paths.budget(t.slug))})`),
    "",
    "## Bestsellers",
    ...bestsellers.map((p) => `- [${p.title}](${abs(paths.product(p))}): ${formatINR(p.price)} (MRP ${formatINR(p.mrp)}). ${p.summary}`),
    "",
    "## Buying guides",
    ...posts.map((p) => `- [${p.title}](${abs(paths.guide(p.slug))}): ${p.excerpt}`),
    "",
    "## Policies",
    ...policyPages.map((p) => `- [${p.title}](${abs(paths.policy(p.slug as "shipping"))}): ${p.answer}`),
    "",
    "## Customer care",
    `- Phone: ${care.phone} (${care.hours})`,
    `- Email: ${care.email}`,
    `- [Track an order](${abs(paths.track())}) with the order number and phone, no login needed.`,
    `- [Contact page](${abs(paths.contact())}) · [FAQ](${abs(paths.faq())}) · [About](${abs(paths.about())})`,
    "",
    "## FAQ",
    ...faqs.flatMap((f) => [`### ${f.q}`, f.a, ""]),
    "## Optional",
    `- [Sitemap](${abs("/sitemap.xml")})`,
    `- [Google Merchant product feed](${abs("/feeds/google.xml")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
