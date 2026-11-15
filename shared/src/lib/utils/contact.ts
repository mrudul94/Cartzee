/** "+91 90000 00000" → "tel:+919000000000". */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+${digits}`}`;
}

/** WhatsApp click-to-chat link for a number in international format (digits only), with optional prefilled text. */
export function whatsappHref(number: string, text?: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
