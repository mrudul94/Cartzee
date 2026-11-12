import { buildCategoryTree } from "@/components/layout/MegaMenu";
import { aboutPage, policies } from "@/lib/content/pages";
import { repo } from "@/lib/data";
import { storeFaqs } from "@/lib/seed/faqs";
import { site } from "@/lib/site";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { SHIPPING } from "@/lib/utils/delivery";
import { formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;

const abs = (p: string) => `${site.url}${p}`;

/**
 * /llms.txt (llmstxt.org): a plain-Markdown map of the store for AI assistants and answer engines,
 * generated from the live catalogue so it never goes stale.
 */
export async function GET() {
  const [categories, products, posts] = await Promise.all([repo.listCategories(), repo.listProducts(), repo.listPosts()]);
  const tree = buildCategoryTree(categories);
  const bestsellers = products.filter((p) => p.isBestseller);

  const lines = [
    `# ${site.name}`,
    "",
    `> ${aboutPage.answer}`,
    "",
    `- Ships to all Indian PIN codes, usually in 4 to 8 days. Free delivery above ${formatINR(SHIPPING.freeAbove)}, otherwise ${formatINR(SHIPPING.fee)}.`,
    "- Prepaid orders only (UPI, credit/debit cards, netbanking via Razorpay). No Cash on Delivery.",
    `- Damaged, defective or wrong items can be reported within ${site.returnWindowDays} days of delivery for a replacement or full refund.`,
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
    ...Object.values(policies).map((p) => `- [${p.title}](${abs(paths.policy(p.slug as keyof typeof policies))}): ${p.answer}`),
    "",
    "## Customer care",
    `- Phone: ${site.care.phone} (${site.care.hours})`,
    `- Email: ${site.care.email}`,
    `- [Track an order](${abs(paths.track())}) with the order number and phone, no login needed.`,
    `- [Contact page](${abs(paths.contact())}) · [FAQ](${abs(paths.faq())}) · [About](${abs(paths.about())})`,
    "",
    "## FAQ",
    ...storeFaqs.flatMap((f) => [`### ${f.q}`, f.a, ""]),
    "## Optional",
    `- [Sitemap](${abs("/sitemap.xml")})`,
    `- [Google Merchant product feed](${abs("/feeds/google.xml")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
