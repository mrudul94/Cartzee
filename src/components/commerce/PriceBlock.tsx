import { cn } from "@/lib/utils/cn";
import { calcDiscount, formatINR } from "@/lib/utils/format";

export type PriceBlockProps = {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  /** "Inclusive of all taxes" line (product page). */
  showTaxNote?: boolean;
  className?: string;
};

const priceSize = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };
const mrpSize = { sm: "text-sm", md: "text-base", lg: "text-lg" };

/** Sale price, struck-through MRP and % off. Used by cards, product page, cart and sticky bar. */
export function PriceBlock({ price, mrp, size = "md", showTaxNote = false, className }: PriceBlockProps) {
  const off = calcDiscount(mrp, price);
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="sr-only">Sale price</span>
        <span className={cn("font-body font-bold text-text", priceSize[size])}>{formatINR(price)}</span>
        {off > 0 && (
          <>
            <span className="sr-only">Maximum retail price</span>
            <s className={cn("text-text-muted", mrpSize[size])}>{formatINR(mrp)}</s>
            <span className={cn("font-semibold text-success", mrpSize[size])}>{off}% off</span>
          </>
        )}
      </p>
      {showTaxNote && <p className="text-sm text-text-muted">MRP inclusive of all taxes</p>}
    </div>
  );
}
