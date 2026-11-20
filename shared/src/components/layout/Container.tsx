import type { ElementType, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const containerVariants = cva("mx-auto w-full px-4 md:px-6", {
  variants: { width: { default: "max-w-container", narrow: "max-w-narrow", prose: "max-w-prose", full: "max-w-none" } },
  defaultVariants: { width: "default" },
});

export type ContainerProps = HTMLAttributes<HTMLElement> & VariantProps<typeof containerVariants> & { as?: ElementType };

/** Centred page-width wrapper with the standard 16/24px gutters. */
export function Container({ as: Tag = "div", width, className, ...rest }: ContainerProps) {
  return <Tag className={cn(containerVariants({ width }), className)} {...rest} />;
}

export const sectionVariants = cva("w-full", {
  variants: {
    background: {
      background: "bg-background",
      surface: "bg-surface",
      secondary: "bg-secondary",
      soft: "bg-primary-soft",
      ink: "bg-ink text-text-inverse",
    },
    spacing: { none: "py-0", panel: "py-1.5 md:py-2", sm: "py-4 md:py-6", md: "py-6 md:py-10", lg: "py-10 md:py-16" },
  },
  defaultVariants: { background: "background", spacing: "md" },
});

export type SectionProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
    containerWidth?: VariantProps<typeof containerVariants>["width"];
    /** Marketplace "panel": content sits in a white card on the page (edge to edge on phones). Implies tight spacing. */
    panel?: boolean;
  };

/** Full-bleed page band (background token + vertical rhythm) with a Container inside. */
export function Section({ background, spacing, containerWidth, panel = false, className, children, ...rest }: SectionProps) {
  return (
    <section className={cn(sectionVariants({ background, spacing: panel ? "panel" : spacing }), className)} {...rest}>
      <Container width={containerWidth}>
        {panel ? <div className="-mx-4 border-y border-border bg-surface px-4 py-4 md:mx-0 md:rounded-xl md:border md:px-4 md:py-4">{children}</div> : children}
      </Container>
    </section>
  );
}
