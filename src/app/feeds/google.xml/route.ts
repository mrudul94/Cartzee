import { repo } from "@/lib/data";
import { site } from "@/lib/site";
import { SHIPPING } from "@/lib/utils/delivery";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
const abs = (p: string) => (p.startsWith("http") ? p : `${site.url}${p}`);
const money = (n: number) => `${n.toFixed(2)} INR`;

/**
 * /feeds/google.xml: Google Merchant Center product feed (RSS 2.0 + g: namespace).
 * Add it in Merchant Center → Products → Feeds → Scheduled fetch.
 * `price` is the regular price (MRP) and `sale_price` the selling price, matching what the product page shows.
 */
export async function GET() {
  const [products, categories] = await Promise.all([repo.listProducts(), repo.listCategories()]);
  const name = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  const items = products.map((p) => {
    const [main, ...extra] = p.images;
    const onSale = p.mrp > p.price;
    return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.title)}</g:title>
      <g:description>${esc(`${p.summary} ${p.description}`.slice(0, 4900))}</g:description>
      <g:link>${esc(abs(paths.product(p)))}</g:link>
      ${main ? `<g:image_link>${esc(abs(main.src))}</g:image_link>` : ""}
      ${extra.slice(0, 10).map((i) => `<g:additional_image_link>${esc(abs(i.src))}</g:additional_image_link>`).join("\n      ")}
      <g:availability>${p.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${money(onSale ? p.mrp : p.price)}</g:price>
      ${onSale ? `<g:sale_price>${money(p.price)}</g:sale_price>` : ""}
      <g:condition>new</g:condition>
      <g:brand>${esc(site.name)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(`${name(p.categorySlug)} > ${name(p.subcategorySlug)}`)}</g:product_type>
      <g:material>${esc(p.material)}</g:material>
      <g:color>${esc(p.colour)}</g:color>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>${money(p.price >= SHIPPING.freeAbove ? 0 : SHIPPING.fee)}</g:price>
        <g:min_handling_time>1</g:min_handling_time>
        <g:max_handling_time>2</g:max_handling_time>
        <g:min_transit_time>3</g:min_transit_time>
        <g:max_transit_time>8</g:max_transit_time>
      </g:shipping>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${esc(site.url)}</link>
    <description>${esc(site.description)}</description>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
