import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { site } from "@/lib/site";

/** City Seller logo: the "C" shopping-bag mark plus the wordmark (files from `pnpm logo`). */
export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={cn("inline-flex min-h-11 shrink-0 items-center gap-2", className)}>
      <Image src="/logo/mark.png" alt="" width={128} height={128} priority className="h-9 w-9" />
      <Image src={inverse ? "/logo/wordmark-white.png" : "/logo/wordmark.png"} alt="" width={415} height={96} priority className="h-6 w-auto" />
    </Link>
  );
}
