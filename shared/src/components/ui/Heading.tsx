import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const headingVariants = cva("font-heading font-semibold tracking-tight text-text", {
  variants: {
    size: {
      sm: "text-lg",
      md: "text-xl md:text-2xl",
      lg: "text-2xl md:text-3xl",
      xl: "text-3xl md:text-4xl",
      display: "text-4xl md:text-5xl",
    },
  },
  defaultVariants: { size: "lg" },
});

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & { as?: "h1" | "h2" | "h3" | "h4" | "p" };

/** Semantic level (`as`) is independent from visual size, so outline stays logical. */
export function Heading({ as: Tag = "h2", size, className, ...rest }: HeadingProps) {
  return <Tag className={cn(headingVariants({ size }), className)} {...rest} />;
}
