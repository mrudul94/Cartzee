import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-sm font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        sale: "bg-primary text-text-inverse",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        error: "bg-error-soft text-error",
        neutral: "bg-secondary text-text",
        outline: "border border-border-strong bg-surface text-text",
        dark: "bg-ink text-text-inverse",
      },
      size: { sm: "px-2 py-0.5 text-xs", md: "px-3 py-1 text-sm" },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ variant, size, className, ...rest }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...rest} />;
}
