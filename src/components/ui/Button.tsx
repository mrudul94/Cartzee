import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ColorToken } from "@/design-system/tokens";
import { cn } from "@/lib/utils/cn";
import { tokenStyle, type SizeProp } from "@/lib/utils/token-style";

export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-body font-semibold transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Buy / Add to Cart only — the single CTA colour. */
        primary: "bg-primary text-text-inverse hover:bg-primary-hover",
        secondary: "bg-ink text-text-inverse hover:bg-ink/85",
        soft: "bg-secondary text-text hover:bg-secondary-strong",
        outline: "border border-border-strong bg-surface text-text hover:bg-background",
        ghost: "text-text hover:bg-secondary/60",
        link: "h-auto px-0 text-text underline underline-offset-4 hover:text-primary",
        danger: "bg-error text-text-inverse hover:bg-error/90",
        inverse: "bg-surface text-text hover:bg-background",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-11 w-11 p-0",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);

type Common = VariantProps<typeof buttonVariants> & {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  /** Token overrides (map to CSS variables, never raw values). */
  width?: SizeProp;
  height?: SizeProp;
  color?: ColorToken;
  textColor?: ColorToken;
  className?: string;
  children?: ReactNode;
};

export type ButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    /** When set, renders a Next.js link styled as a button. */
    href?: string;
    prefetch?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  icon,
  iconPosition = "left",
  loading = false,
  width,
  height,
  color,
  textColor,
  className,
  children,
  href,
  prefetch,
  type = "button",
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);
  const styles = { ...tokenStyle({ width, height, bg: color, fg: textColor }), ...style };
  const content = (
    <>
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : iconPosition === "left" && icon}
      {children}
      {!loading && iconPosition === "right" && icon}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        prefetch={prefetch}
        className={classes}
        style={styles}
        aria-disabled={disabled || undefined}
        onClick={rest.onClick as never}
        aria-label={rest["aria-label"]}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      style={styles}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
