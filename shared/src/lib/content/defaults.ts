/**
 * Default store settings: exactly what the shop showed before the CMS existed.
 * Used when nothing has been saved yet, and as the fallback for any missing field.
 * Editable in Admin → Settings (stored in site_content["settings"]).
 * Never put secrets here: keys live only in server env vars.
 */
export const DEFAULT_SETTINGS = {
  promo: {
    enabled: true,
    text: "Extra 5% off on UPI payments",
    secondary: "Free delivery above ₹499",
  },
  care: {
    phone: "+91 90000 00000",
    /** WhatsApp number in international format, digits only (91XXXXXXXXXX). */
    whatsapp: "919000000000",
    email: "care@cityseller.in",
    hours: "Mon to Sat, 10 AM to 7 PM IST",
  },
  social: {
    instagram: "https://instagram.com/cityseller",
    facebook: "https://facebook.com/cityseller",
    youtube: "https://youtube.com/@cityseller",
  },
  delivery: {
    freeAbove: 499,
    fee: 49,
    returnWindowDays: 7,
  },
  upiDiscountPercent: 5,
  /** Legacy: the floating WhatsApp button was removed from the shop; kept so older saved settings still load. */
  whatsappButton: { enabled: false, message: "Hi City Seller, I have a question about " },
};
