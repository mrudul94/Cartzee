import Image from "next/image";
import Link from "next/link";

export type HeroBannerProps = {
  /** Background photo (text slides) or finished artwork (1792 × 768, text baked in). */
  image: { src: string; alt: string };
  /** Heading level for the slide title (h1 on the homepage's first slide). */
  as?: "h1" | "h2" | "h3";
  /** Load eagerly (LCP). Only the first slide is priority; the others lazy-load. */
  priority?: boolean;
  /** When set (and there's no button), the whole slide links here. */
  href?: string;
  /** Visual copy used by the looping carousel: no heading, no link target for assistive tech. */
  decorative?: boolean;
  /** Name drawn over the bottom of the picture (category slides in "Shop by collection"); the photo fills the card. */
  caption?: { title: string; subtitle?: string };
  /** Offer slide: small label, title, text and a working button over the left of the photo. */
  overlay?: { eyebrow?: string; title: string; text?: string; cta?: { label: string; href: string } };
};

/**
 * Homepage hero slide, a rounded card in one of three looks:
 * - artwork: the finished picture at its own 7:3 shape, nothing drawn on top (never cropped);
 * - overlay: a photo with a dark fade on the left carrying the label, title, text and a "Shop now" button;
 * - caption: a photo with the name over a dark fade at the bottom (Shop by collection slider).
 */
export function HeroBanner({ image, as: H = "h1", priority = false, href, decorative, caption, overlay }: HeroBannerProps) {
  const cta = overlay?.cta?.label && overlay.cta.href ? overlay.cta : undefined;
  const fills = Boolean(caption || overlay);
  const picture = (
    <div className={overlay ? "relative aspect-banner w-full overflow-hidden rounded-xl bg-ink md:aspect-hero" : "relative aspect-hero w-full overflow-hidden rounded-xl bg-secondary"}>
      {image.src && (
        <Image
          src={image.src}
          alt={href || decorative || overlay ? "" : image.alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(min-width: 768px) 64vw, 86vw"
          draggable={false}
          className={fills ? "select-none object-cover" : "select-none object-contain"}
        />
      )}
      {caption && (
        <>
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-overlay/80 via-overlay/20 to-overlay/0" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 flex flex-col p-4 text-text-inverse md:p-6">
            <span className="text-xl font-semibold leading-tight md:text-3xl">{caption.title}</span>
            {caption.subtitle && <span className="text-sm text-text-inverse/80 md:text-base">{caption.subtitle}</span>}
          </span>
        </>
      )}
      {overlay && (
        <>
          {/* Dark fade on the left keeps the white text readable on any photo. */}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-overlay/75 via-overlay/40 to-overlay/0" />
          <div className="absolute inset-y-0 left-0 flex max-w-prose flex-col justify-center gap-1 p-5 text-text-inverse md:gap-2 md:p-10">
            {overlay.eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-text-inverse/90 md:text-sm">{overlay.eyebrow}</p>}
            {decorative ? (
              <p className="text-2xl font-bold leading-tight md:text-5xl">{overlay.title}</p>
            ) : (
              <H className="text-2xl font-bold leading-tight md:text-5xl">{overlay.title}</H>
            )}
            {overlay.text && <p className="hidden text-base text-text-inverse/90 sm:block md:text-lg">{overlay.text}</p>}
            {cta && (
              <Link
                href={cta.href}
                draggable={false}
                tabIndex={decorative ? -1 : undefined}
                className="mt-2 inline-flex min-h-11 items-center self-start rounded-lg bg-surface px-5 font-semibold text-text shadow-md transition-colors duration-fast hover:bg-secondary focus-visible:outline-none focus-visible:shadow-focus md:mt-3"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
  // A slide with its own button isn't wrapped in a link (links can't contain links).
  const wholeLink = href && !cta ? href : undefined;
  return (
    <div className="relative w-full">
      {/* Artwork/caption slides carry their message in the picture; this heading keeps the page outline for screen readers. */}
      {!decorative && !overlay && <H className="sr-only">{image.alt}</H>}
      {wholeLink ? (
        <Link href={wholeLink} aria-label={decorative ? undefined : overlay?.title ?? image.alt} draggable={false} className="block rounded-xl focus-visible:outline-none focus-visible:shadow-focus">
          {picture}
        </Link>
      ) : (
        picture
      )}
    </div>
  );
}
