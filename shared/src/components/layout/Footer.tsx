import Link from "next/link";
import { Clock, Mail, Phone } from "lucide-react";
import { SocialIcon } from "@/components/ui/Icon";
import type { Settings } from "@/lib/content/schema";
import { site } from "@/lib/site";
import { telHref } from "@/lib/utils/contact";
import { paths } from "@/lib/utils/paths";
import { Container } from "./Container";
import { Logo } from "./Logo";
import type { NavCategory } from "./MegaMenu";

const link = "inline-flex min-h-9 items-center text-base text-text-inverse/80 hover:text-text-inverse hover:underline";
const heading = "mb-3 font-heading text-lg font-semibold text-text-inverse";

/** Site footer: care details, shop, help and policy links, socials and business name. */
export function Footer({ tree, settings }: { tree: NavCategory[]; settings: Settings }) {
  const { care, social } = settings;
  const links = { instagram: social.instagram, facebook: social.facebook, youtube: social.youtube };
  const brands = (["instagram", "facebook", "youtube"] as const).filter((b) => links[b]);
  return (
    <footer className="bg-ink text-text-inverse">
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo inverse />
          <p className="mt-3 text-base text-text-inverse/80">{site.tagline}.</p>
          <ul className="mt-4 flex gap-2" aria-label="Social media">
            {brands.map((b) => (
              <li key={b}>
                <a
                  href={links[b]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} on ${b}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-surface/10 hover:bg-surface/20"
                >
                  <SocialIcon brand={b} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={heading}>Customer care</h2>
          <ul className="flex flex-col gap-2 text-base text-text-inverse/80">
            <li className="flex items-center gap-2">
              <Clock aria-hidden className="h-4 w-4" /> {care.hours}
            </li>
            <li>
              <a href={telHref(care.phone)} className={`${link} gap-2`}>
                <Phone aria-hidden className="h-4 w-4" /> {care.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${care.email}`} className={`${link} gap-2`}>
                <Mail aria-hidden className="h-4 w-4" /> {care.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={heading}>Shop</h2>
          <ul className="flex flex-col">
            {tree.map((c) => (
              <li key={c.slug}>
                <Link href={paths.category(c)} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-1">
          <div>
            <h2 className={heading}>Help</h2>
            <ul className="flex flex-col">
              <li><Link href={paths.faq()} className={link}>FAQ</Link></li>
              <li><Link href={paths.contact()} className={link}>Contact us</Link></li>
              <li><Link href={paths.track()} className={link}>Track order</Link></li>
              <li><Link href={paths.guides()} className={link}>Buying guides</Link></li>
              <li><Link href={paths.about()} className={link}>About us</Link></li>
            </ul>
          </div>
          <div>
            <h2 className={heading}>Policies</h2>
            <ul className="flex flex-col">
              <li><Link href={paths.policy("shipping")} className={link}>Shipping policy</Link></li>
              <li><Link href={paths.policy("returns")} className={link}>Returns & refunds</Link></li>
              <li><Link href={paths.policy("privacy")} className={link}>Privacy policy</Link></li>
              <li><Link href={paths.policy("terms")} className={link}>Terms of service</Link></li>
            </ul>
          </div>
        </div>
      </Container>
      <div className="border-t border-surface/10">
        <Container className="flex flex-col gap-2 py-6 text-sm text-text-inverse/80 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All prices in ₹ and inclusive of taxes.
          </p>
          <p>Prepaid orders only: UPI, cards and netbanking via Razorpay.</p>
        </Container>
      </div>
    </footer>
  );
}
