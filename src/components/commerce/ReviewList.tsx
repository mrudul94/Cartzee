import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { RatingStars } from "./RatingStars";

export type ReviewListProps = { reviews: Review[]; rating: number; reviewCount: number; productTitle: string };

/** Rating summary with distribution bars, then individual reviews with photos. */
export function ReviewList({ reviews, rating, reviewCount, productTitle }: ReviewListProps) {
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));
  const max = Math.max(1, ...dist.map((d) => d.n));
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="flex flex-col gap-3">
        <p className="font-heading text-5xl font-semibold text-text">{rating.toFixed(1)}</p>
        <RatingStars value={rating} size="md" />
        <p className="text-sm text-text-muted">Based on {reviewCount} ratings</p>
        <ul className="mt-2 flex flex-col gap-1.5" aria-label="Rating breakdown of written reviews">
          {dist.map((d) => (
            <li key={d.star} className="flex items-center gap-2 text-sm text-text-muted">
              <span className="w-6">{d.star}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-rating" style={{ width: `${(d.n / max) * 100}%` }} />
              </span>
              <span className="w-6 text-right">{d.n}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="flex flex-col gap-6 md:col-span-2">
        {reviews.length === 0 && <li className="text-text-muted">No written reviews yet for {productTitle}.</li>}
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-border pb-6 last:border-0">
            <div className="flex flex-wrap items-center gap-2">
              <RatingStars value={r.rating} />
              <h3 className="text-base font-semibold text-text">{r.title}</h3>
            </div>
            <p className="mt-2 text-base text-text">{r.body}</p>
            {r.photos.length > 0 && (
              <ul className="mt-3 flex gap-2" aria-label="Customer photos">
                {r.photos.map((src, i) => (
                  <li key={src + i} className="relative h-20 w-20 overflow-hidden rounded-md bg-background">
                    <Image src={src} alt={`Photo ${i + 1} from ${r.author}'s review`} fill sizes="80px" className="object-cover" />
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
              <span className="font-medium text-text">{r.author}</span>
              <span>{r.city}</span>
              <span aria-hidden>·</span>
              <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
              {r.verified && (
                <span className="inline-flex items-center gap-1 text-success">
                  <BadgeCheck aria-hidden className="h-4 w-4" /> Verified buyer
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
