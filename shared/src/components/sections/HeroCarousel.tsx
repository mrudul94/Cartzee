"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { breakpoint } from "@/design-system/tokens";
import { cn } from "@/lib/utils/cn";
import { HeroBanner, type HeroBannerProps } from "./HeroBanner";

export type HeroSlide = Omit<HeroBannerProps, "as" | "priority" | "decorative"> & { id: string };

/** Share of the hero width taken by the centred card; the rest shows the neighbours peeking in. */
const CARD_WIDTH = { mobile: 86, desktop: 64 } as const;
/** Drag distance (as a share of the card) that changes slide. */
const SWIPE_THRESHOLD = 0.15;

const arrow =
  "absolute top-1/2 z-raised hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-text shadow-md hover:bg-surface focus-visible:outline-none focus-visible:shadow-focus md:inline-flex";

/** Dot for the active slide: fills like a timer while autoplay runs. */
function TimerDot({ running, ms }: { running: boolean; ms: number }) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <span className="block h-2 w-6 overflow-hidden rounded-full bg-ink/20">
      <span
        className="block h-full w-full origin-left rounded-full bg-primary"
        style={{ transform: `scaleX(${running ? (started ? 1 : 0) : 1})`, transition: running && started ? `transform ${ms}ms linear` : "none" }}
      />
    </span>
  );
}

/**
 * Homepage hero (edited in Admin → Homepage): rounded image cards that glide sideways, with the
 * previous and next cards peeking in (smaller and faded). Swipe or drag, arrows on desktop, dots on
 * all sizes. Autoplays every 4 s and loops; pauses on hover, focus and drag, and
 * for visitors who prefer reduced motion. All slides are in the HTML for search engines.
 */
export function HeroCarousel({
  slides,
  intervalMs = 4000,
  label = "Featured offers",
  headingLevel,
  priorityFirst = true,
  className,
}: {
  slides: HeroSlide[];
  intervalMs?: number;
  /** Name of the carousel for screen readers. */
  label?: string;
  /** Slide heading level. Default: the first slide is the page h1 (homepage hero), the rest h2. */
  headingLevel?: "h2" | "h3";
  /** Load the first image eagerly (only for the carousel at the top of the page). */
  priorityFirst?: boolean;
  className?: string;
}) {
  const total = slides.length;
  const loop = total > 1;
  // Looping track: a copy of the last slide before the first and of the first after the last.
  const track = loop ? [slides[total - 1]!, ...slides, slides[0]!] : slides;
  const [pos, setPos] = useState(loop ? 1 : 0);
  const [animate, setAnimate] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; width: number } | null>(null);
  const moved = useRef(false);
  const busy = useRef(false);

  const index = loop ? (pos - 1 + total) % total : 0;
  const width = desktop ? CARD_WIDTH.desktop : CARD_WIDTH.mobile;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${breakpoint.md})`);
    const sync = () => {
      setReduced(motion.matches);
      setDesktop(wide.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  const goTo = (next: number) => {
    if (!loop || busy.current) return;
    busy.current = !reduced;
    setAnimate(true);
    setPos(next);
  };
  const go = (d: number) => goTo(pos + d);

  // After gliding onto a copy, jump (without animation) to the real slide it mirrors.
  const settle = () => {
    busy.current = false;
    if (pos === 0 || pos === total + 1) {
      setAnimate(false);
      setPos(pos === 0 ? total : 1);
    }
  };
  useEffect(() => {
    if (reduced) settle();
  }, [pos, reduced]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const running = loop && !hovered && drag === null && !reduced;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => go(1), intervalMs);
    return () => clearTimeout(t);
  }, [pos, running, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------------------------------------------------------- swipe / drag */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!loop || (e.pointerType === "mouse" && e.button !== 0)) return;
    start.current = { x: e.clientX, y: e.clientY, width: e.currentTarget.offsetWidth * (width / 100) };
    moved.current = false;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!moved.current && Math.abs(dx) < 6) return;
    if (!moved.current && Math.abs(e.clientY - s.y) > Math.abs(dx)) {
      start.current = null; // vertical scroll, not a swipe
      return;
    }
    moved.current = true;
    setDrag(dx);
  };
  const endDrag = () => {
    const s = start.current;
    start.current = null;
    if (!s || drag === null) return setDrag(null);
    const shift = drag / s.width;
    setDrag(null);
    if (shift <= -SWIPE_THRESHOLD) go(1);
    else if (shift >= SWIPE_THRESHOLD) go(-1);
  };

  // Centre the active card; each step moves by one card width plus the 1rem gap.
  const transform = `translate3d(calc(${(100 - width) / 2}% - ${pos} * (${width}% + 1rem) + ${drag ?? 0}px), 0, 0)`;

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative pb-0 pt-3 md:pt-5", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && setHovered(false)}
    >
      <div className="relative overflow-hidden">
        <div
          className={cn("flex touch-pan-y gap-4", animate && drag === null && "transition-transform duration-slide ease-standard motion-reduce:transition-none")}
          style={{ transform }}
          onTransitionEnd={(e) => e.target === e.currentTarget && settle()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={(e) => {
            // A drag that ends over a slide must not also open its link.
            if (moved.current) {
              e.preventDefault();
              e.stopPropagation();
              moved.current = false;
            }
          }}
        >
          {track.map(({ id, ...slide }, i) => {
            const copy = loop && (i === 0 || i === track.length - 1);
            const active = i === pos;
            const realIndex = loop ? i - 1 : i;
            return (
              <div
                key={copy ? `copy-${i}-${id}` : id}
                role={copy ? undefined : "group"}
                aria-roledescription={copy ? undefined : "slide"}
                aria-label={copy ? undefined : `${realIndex + 1} of ${total}`}
                aria-hidden={!active || undefined}
                inert={!active || undefined}
                className={cn("shrink-0 transition duration-slide ease-standard motion-reduce:transition-none", active ? "scale-100 opacity-100" : "scale-95 opacity-60")}
                style={{ width: `${width}%` }}
              >
                <HeroBanner {...slide} as={headingLevel ?? (realIndex === 0 ? "h1" : "h2")} priority={priorityFirst && !copy && realIndex === 0} decorative={copy} />
              </div>
            );
          })}
        </div>
        {loop && (
          <>
            <button type="button" className={cn(arrow, "left-4")} onClick={() => go(-1)} aria-label="Previous slide">
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button type="button" className={cn(arrow, "right-4")} onClick={() => go(1)} aria-label="Next slide">
              <ChevronRight aria-hidden className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {loop && (
        <Container className="flex items-center justify-center gap-1">
          <ul className="flex items-center gap-1" aria-label="Choose slide">
            {slides.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goTo(i + 1)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index || undefined}
                  className="inline-flex h-8 w-8 items-center justify-center focus-visible:outline-none focus-visible:shadow-focus"
                >
                  {i === index ? <TimerDot key={`${pos}-${running}`} running={running} ms={intervalMs} /> : <span className="block h-2 w-2 rounded-full bg-ink/30" />}
                </button>
              </li>
            ))}
          </ul>
        </Container>
      )}
    </section>
  );
}
