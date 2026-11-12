import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type RatingStarsProps = {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
};

const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

/** Read-only star rating with fractional fill and an accessible text label. */
export function RatingStars({ value, count, size = "sm", showValue = false, className }: RatingStarsProps) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const label = `Rated ${value.toFixed(1)} out of 5${count !== undefined ? ` from ${count} reviews` : ""}`;
  const row = (cls: string) => (
    <span className={cn("flex", cls)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={cn(sizes[size], "shrink-0")} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span role="img" aria-label={label} className="relative inline-flex">
        {row("text-secondary-strong")}
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
          {row("text-rating")}
        </span>
      </span>
      {showValue && <span className="text-sm font-semibold text-text">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-sm text-text-muted">({count})</span>}
    </span>
  );
}
