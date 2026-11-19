import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { site } from "@/lib/site";

/**
 * Cartzee logo: the "C" shopping-bag mark plus the name as text.
 * (Swap the text for a wordmark image once the Cartzee logo artwork exists; `pnpm logo` builds the files.)
 */
export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={cn("inline-flex min-h-11 shrink-0 items-center gap-2", className)}>
      <Image src="/logo/mark.png" alt="" width={128} height={128} priority className="h-9 w-9" />
      <span aria-hidden className={cn("text-2xl font-bold tracking-tight", inverse ? "text-text-inverse" : "text-text")}>
        {site.name}
      </span>
    </Link>
  );
}
