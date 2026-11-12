import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const bannerVariants = cva("relative flex min-h-48 overflow-hidden rounded-xl", {
  variants: {
    tone: { soft: "bg-primary-soft text-text", sand: "bg-secondary text-text", ink: "bg-ink text-text-inverse" },
  },
  defaultVariants: { tone: "sand" },
});

export type SaleBannerProps = VariantProps<typeof bannerVariants> & {
  eyebrow?: string;
  title: string;
  text?: string;
  cta: { label: string; href: string };
  image?: string;
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** Promotional banner (flash sale, category sale). Text is live HTML, never baked into images. */
export function SaleBanner({ eyebrow, title, text, cta, image, tone, headingLevel = "h3", className }: SaleBannerProps) {
  const H = headingLevel;
  return (
    <div className={cn(bannerVariants({ tone }), className)}>
      {image && (
        <Image src={image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="z-base object-cover object-right opacity-90" />
      )}
      <div className="relative z-raised flex max-w-96 flex-col items-start justify-center gap-2 p-6 md:p-8">
        {eyebrow && <p className={cn("text-sm font-semibold uppercase tracking-wider", tone === "ink" ? "text-text-inverse" : "text-primary")}>{eyebrow}</p>}
        <H className="font-heading text-2xl font-semibold md:text-3xl">{title}</H>
        {text && <p className="text-base">{text}</p>}
        <Button href={cta.href} variant={tone === "ink" ? "inverse" : "secondary"} className="mt-2">
          {cta.label}
        </Button>
      </div>
    </div>
  );
}
