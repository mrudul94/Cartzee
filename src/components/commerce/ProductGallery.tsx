"use client";

import Image from "next/image";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";

export type ProductGalleryProps = { images: { src: string; alt: string }[]; title: string; className?: string };

const navBtn =
  "absolute top-1/2 z-raised inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-text shadow-md hover:bg-surface focus-visible:outline-none focus-visible:shadow-focus";

/** Main image + thumbnails, arrow-key navigation, counter, and a zoom modal with hover-to-magnify. */
export function ProductGallery({ images, title, className }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [magnified, setMagnified] = useState(false);
  const total = images.length;
  const current = images[index] ?? images[0];
  const go = (d: number) => setIndex((i) => (i + d + total) % total);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  if (!current) return null;

  return (
    <div className={cn("flex flex-col gap-3 md:flex-row-reverse", className)} onKeyDown={onKey}>
      <div className="relative flex-1">
        <div className="relative aspect-product overflow-hidden rounded-lg bg-background">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="absolute inset-0 z-base cursor-zoom-in focus-visible:outline-none focus-visible:shadow-focus"
            aria-label={`Zoom image ${index + 1} of ${total}`}
          />
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 text-sm text-text">
            <ZoomIn aria-hidden className="h-4 w-4" /> {index + 1} / {total}
          </span>
        </div>
        {total > 1 && (
          <>
            <button type="button" className={cn(navBtn, "left-3")} onClick={() => go(-1)} aria-label="Previous image">
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button type="button" className={cn(navBtn, "right-3")} onClick={() => go(1)} aria-label="Next image">
              <ChevronRight aria-hidden className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <ul className="flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-visible" aria-label={`${title} images`}>
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}: ${img.alt}`}
                aria-current={i === index || undefined}
                className={cn(
                  "relative block h-16 w-16 overflow-hidden rounded-md border-2 bg-background md:h-20 md:w-20 focus-visible:outline-none focus-visible:shadow-focus",
                  i === index ? "border-ink" : "border-transparent hover:border-border-strong",
                )}
              >
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={zoomOpen} onOpenChange={setZoomOpen} title={title} size="lg">
        <div
          className={cn("relative aspect-square w-full overflow-hidden rounded-md bg-background", magnified ? "cursor-zoom-out" : "cursor-zoom-in")}
          onMouseMove={onMove}
          onClick={() => setMagnified((m) => !m)}
          onMouseLeave={() => setMagnified(false)}
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="(min-width: 1024px) 60rem, 100vw"
            className={cn("object-contain transition-transform duration-base", magnified && "scale-150")}
            style={{ transformOrigin: origin }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={() => go(-1)} className="inline-flex h-11 items-center gap-1 px-2 text-text hover:text-primary">
            <ChevronLeft aria-hidden className="h-5 w-5" /> Previous
          </button>
          <span className="text-sm text-text-muted">
            {index + 1} / {total}
          </span>
          <button type="button" onClick={() => go(1)} className="inline-flex h-11 items-center gap-1 px-2 text-text hover:text-primary">
            Next <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </Modal>
    </div>
  );
}
