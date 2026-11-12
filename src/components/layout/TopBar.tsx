import Link from "next/link";
import { SocialIcon } from "@/components/ui/Icon";
import { site } from "@/lib/site";
import { paths } from "@/lib/utils/paths";
import { Container } from "./Container";

/** Promo strip: offer text, social links, Track order and Login. */
export function TopBar() {
  return (
    <div className="bg-ink text-sm text-text-inverse">
      <Container className="flex min-h-9 items-center justify-center gap-4 md:justify-between">
        <p className="py-2 text-center">
          <strong className="font-semibold">{site.promo}</strong>
          <span className="hidden sm:inline"> · {site.promoSecondary}</span>
        </p>
        <div className="hidden items-center gap-4 md:flex">
          <ul className="flex items-center gap-1" aria-label="Social media">
            {(["instagram", "facebook", "youtube"] as const).map((b) => (
              <li key={b}>
                <a
                  href={site.social[b]}
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
          <Link href={paths.track()} className="hover:underline">
            Track order
          </Link>
          <Link href={paths.login()} className="hover:underline">
            Login
          </Link>
        </div>
      </Container>
    </div>
  );
}
