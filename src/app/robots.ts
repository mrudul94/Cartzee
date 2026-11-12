import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Shop robots.txt. (The admin website answers /robots.txt itself with "Disallow: /", see middleware.)
 * Search and AI answer engines are explicitly welcome on product, category, guide and policy pages.
 */
const PRIVATE = ["/api/", "/cart", "/checkout", "/order/", "/account", "/search", "/admin", "/design-system", "/og"];
const AI_AND_SEARCH_BOTS = ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_AND_SEARCH_BOTS, allow: "/", disallow: PRIVATE },
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
