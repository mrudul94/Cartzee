import type { ElementType, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ColorToken } from "@/design-system/tokens";
import { cn } from "@/lib/utils/cn";
import { tokenStyle } from "@/lib/utils/token-style";

export const cardVariants = cva("rounded-lg bg-surface text-text", {
  variants: {
    padding: { none: "p-0", sm: "p-3", md: "p-4 md:p-6", lg: "p-6 md:p-8" },
    elevation: { flat: "border border-border", raised: "shadow-md", outline: "border border-border-strong" },
    interactive: { true: "transition-shadow duration-base hover:shadow-lg", false: "" },
  },
  defaultVariants: { padding: "md", elevation: "flat", interactive: false },
});

export type CardProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof cardVariants> & { as?: ElementType; background?: ColorToken };

export function Card({ as: Tag = "div", padding, elevation, interactive, background, className, style, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(cardVariants({ padding, elevation, interactive }), className)}
      style={{ ...tokenStyle({ bg: background }), ...style }}
      {...rest}
    />
  );
}
