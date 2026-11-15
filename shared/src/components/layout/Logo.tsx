import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { site } from "@/lib/site";

/** City Seller wordmark: a simple roof-and-door mark plus the name in the heading font. */
export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={cn("inline-flex min-h-11 items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="h-8 w-8 shrink-0">
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <path d="M7 16 16 8l9 8v9H7z" className="fill-surface" />
        <rect x="13.5" y="18" width="5" height="7" rx="1" className="fill-primary" />
      </svg>
      <span className={cn("font-heading text-xl font-bold tracking-tight", inverse ? "text-text-inverse" : "text-text")}>{site.name}</span>
    </Link>
  );
}
