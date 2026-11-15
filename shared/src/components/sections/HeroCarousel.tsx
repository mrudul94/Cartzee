"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HeroBanner, type HeroBannerProps } from "./HeroBanner";

export type HeroSlide = Omit<HeroBannerProps, "as" | "priority" | "background"> & { id: string };

const ctrl =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-text shadow-md hover:bg-surface focus-visible:outline-none focus-visible:shadow-focus";

/**
 * Rotating hero for 2–5 slides (edited in Admin → Homepage). All slides are in the HTML for
 * search engines; only the first image loads eagerly. Auto-advances every 6 s, pauses on hover,
 * focus or the pause button, and never auto-rotates when the visitor prefers reduced motion.
 */
export function HeroCarousel({ slides, intervalMs = 6000 }: { slides: HeroSlide[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const total = slides.length;
  const go = (d: number) => setIndex((i) => (i + d + total) % total);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (total < 2 || paused || hovered || reduced) return;
    const t = setTimeout(() => go(1), intervalMs);
    return () => clearTimeout(t);
  }, [index, paused, hovered, reduced, total, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && setHovered(false)}
    >
      {slides.map(({ id, ...slide }, i) => (
        <div
          key={id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${total}`}
          hidden={i !== index}
        >
          <HeroBanner {...slide} as={i === 0 ? "h1" : "h2"} priority={i === 0} />
        </div>
      ))}
      {total > 1 && (
        <div className="absolute bottom-3 right-4 flex items-center gap-2 md:bottom-6 md:right-6">
          <button type="button" className={ctrl} onClick={() => go(-1)} aria-label="Previous slide">
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
          <ul className="flex items-center gap-1" aria-label="Choose slide">
            {slides.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index || undefined}
                  className="inline-flex h-11 w-6 items-center justify-center focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <span className={cn("block h-2 rounded-full transition-all duration-base", i === index ? "w-5 bg-ink" : "w-2 bg-ink/40")} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={ctrl} onClick={() => go(1)} aria-label="Next slide">
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
          {!reduced && (
            <button type="button" className={ctrl} onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play slideshow" : "Pause slideshow"}>
              {paused ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
