import Image from "next/image";
import Link from "next/link";

export type HeroBannerProps = {
  /** Finished artwork (1792 × 768): headline and button are part of the picture. */
  image: { src: string; alt: string };
  /** Use h1 when the hero is the page's main heading (homepage). Read by screen readers only. */
  as?: "h1" | "h2";
  /** Load eagerly (LCP). Only the first slide is priority; the others lazy-load. */
  priority?: boolean;
  /** When set, the whole slide links here (a category or custom link). */
  href?: string;
  /** Visual copy used by the looping carousel: no heading, no link target for assistive tech. */
  decorative?: boolean;
};

/**
 * Homepage hero slide: a rounded card showing only the artwork, at its own 7:3 shape so nothing
 * is ever cropped (it scales down on phones). No text, buttons or overlays are drawn on top.
 */
export function HeroBanner({ image, as: H = "h1", priority = false, href, decorative }: HeroBannerProps) {
  const picture = (
    <div className="relative aspect-hero w-full overflow-hidden rounded-xl bg-secondary">
      <Image
        src={image.src}
        alt={href || decorative ? "" : image.alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(min-width: 768px) 64vw, 86vw"
        draggable={false}
        className="select-none object-contain"
      />
    </div>
  );
  return (
    <div className="relative w-full">
      {/* The picture carries the message; this heading keeps the page outline for screen readers and search engines. */}
      {!decorative && <H className="sr-only">{image.alt}</H>}
      {href ? (
        <Link href={href} aria-label={decorative ? undefined : image.alt} draggable={false} className="block rounded-xl focus-visible:outline-none focus-visible:shadow-focus">
          {picture}
        </Link>
      ) : (
        picture
      )}
    </div>
  );
}
