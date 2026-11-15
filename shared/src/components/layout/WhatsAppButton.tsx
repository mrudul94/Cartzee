import { SocialIcon } from "@/components/ui/Icon";
import { whatsappHref } from "@/lib/utils/contact";

export type WhatsAppButtonProps = {
  /** International format, digits only (from Admin → Settings → WhatsApp number). */
  number: string;
  /** Prefilled chat text. */
  message?: string;
};

/**
 * Floating "Chat on WhatsApp" button on every shop page (bottom-right). Sits above the mobile
 * sticky buy bar. Number and message are edited in Admin → Settings; it can be switched off there.
 */
export function WhatsAppButton({ number, message }: WhatsAppButtonProps) {
  if (!number) return null;
  return (
    <a
      href={whatsappHref(number, message || undefined)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 right-4 z-sticky inline-flex h-14 items-center gap-2 rounded-full bg-success px-4 text-base font-semibold text-text-inverse shadow-lg transition-transform duration-fast hover:scale-105 focus-visible:outline-none focus-visible:shadow-focus md:bottom-6 md:right-6"
    >
      <SocialIcon brand="whatsapp" size="lg" />
      <span className="hidden md:inline">Chat with us</span>
    </a>
  );
}
