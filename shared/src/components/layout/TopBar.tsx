import Link from "next/link";
import { SocialIcon } from "@/components/ui/Icon";
import type { Settings } from "@/lib/content/schema";
import { site } from "@/lib/site";
import { paths } from "@/lib/utils/paths";
import { Container } from "./Container";

/** Promo strip (editable in Admin → Settings), social links and Track order (account is in the header). */
export function TopBar({ settings }: { settings: Settings }) {
  const { promo, social } = settings;
  const socials = (["instagram", "facebook", "youtube"] as const).filter((b) => social[b]);
  return (
    <div className="bg-ink text-sm text-text-inverse">
      <Container className="flex min-h-9 items-center justify-center gap-4 md:justify-between">
        {promo.enabled && (promo.text || promo.secondary) ? (
          <p className="py-2 text-center">
            {promo.text && <strong className="font-semibold">{promo.text}</strong>}
            {promo.text && promo.secondary && <span className="hidden sm:inline"> · </span>}
            {promo.secondary && <span className={promo.text ? "hidden sm:inline" : undefined}>{promo.secondary}</span>}
          </p>
        ) : (
          <span />
        )}
        <div className="hidden items-center gap-4 md:flex">
          {socials.length > 0 && (
            <ul className="flex items-center gap-1" aria-label="Social media">
              {socials.map((b) => (
                <li key={b}>
                  <a
                    href={social[b]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface/10"
                    aria-label={`${site.name} on ${b}`}
                  >
                    <SocialIcon brand={b} size="sm" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link href={paths.track()} className="hover:underline">
            Track order
          </Link>
        </div>
      </Container>
    </div>
  );
}
