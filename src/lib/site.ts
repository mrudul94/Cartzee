/** Store-wide constants used by layout, SEO and policy pages. Edit here, not in components. */
export const site = {
  name: "City Seller",
  legalName: "City Seller",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "Smart, affordable home needs, delivered across India",
  description:
    "City Seller is an online store for everyday home needs (kitchen, storage, cleaning, bathroom and décor) with honest prices, secure prepaid checkout and delivery across India.",
  promo: "Extra 5% off on UPI payments",
  promoSecondary: "Free delivery above ₹499",
  care: {
    phone: "+91 90000 00000",
    phoneHref: "tel:+919000000000",
    whatsapp: "https://wa.me/919000000000",
    email: "care@cityseller.in",
    hours: "Mon to Sat, 10 AM to 7 PM IST",
  },
  social: {
    instagram: "https://instagram.com/cityseller",
    facebook: "https://facebook.com/cityseller",
    youtube: "https://youtube.com/@cityseller",
  },
  returnWindowDays: 7,
  upiDiscountPercent: 5,
} as const;
