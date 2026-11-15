import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "./Heading";

export type SectionHeaderProps = {
  title: string;
  id?: string;
  subtitle?: string;
  eyebrow?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
};

/** Section title row with optional eyebrow, subtitle and "View all" link. */
export function SectionHeader({ title, id, subtitle, eyebrow, viewAllHref, viewAllLabel = "View all", align = "left", as = "h2", className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8", align === "center" && "flex-col items-center text-center", className)}>
      <div className={cn("max-w-prose", align === "center" && "mx-auto")}>
        {eyebrow && <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <Heading as={as} id={id} size="lg">
          {title}
        </Heading>
        {subtitle && <p className="mt-2 text-base text-text-muted">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="inline-flex min-h-11 items-center gap-1 font-semibold text-text underline-offset-4 hover:underline">
          {viewAllLabel}
          <span className="sr-only">: {title}</span>
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
