/**
 * Fixed store identity (not editable in the admin). Everything a partner may change, such as contact
 * details, social links, the promo strip, delivery fees and return days, lives in Admin → Settings
 * (getSettings() on the server, useSettings() in client components).
 */
export const site = {
  name: "Cartzee",
  legalName: "Cartzee",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "Smart, affordable home needs, delivered across India",
  description:
    "Cartzee is an online store for everyday home needs (kitchen, storage, cleaning, bathroom and décor) with honest prices, secure prepaid checkout and delivery across India.",
} as const;
