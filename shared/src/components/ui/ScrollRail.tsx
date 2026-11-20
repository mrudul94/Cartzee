"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const arrow =
  "absolute top-1/3 z-raised hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-md transition-opacity duration-fast hover:bg-background focus-visible:outline-none focus-visible:shadow-focus md:inline-flex";

/**
 * Sideways-scrolling row (swipe on touch, snap to items) with previous/next arrow buttons on larger
 * screens that hide at either end. Children should be <li> elements.
 */
export function ScrollRail({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const list = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = list.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = list.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scrollBy = (dir: -1 | 1) => list.current?.scrollBy({ left: dir * list.current.clientWidth * 0.9, behavior: "smooth" });

  return (
    <div className={cn("relative", className)}>
      <ul ref={list} aria-label={label} onScroll={update} className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 py-3 md:mx-0 md:scroll-px-2 md:px-2">
        {children}
      </ul>
      <button type="button" aria-label="Scroll left" onClick={() => scrollBy(-1)} className={cn(arrow, "-left-4", edges.start && "pointer-events-none opacity-0")}>
        <ChevronLeft aria-hidden className="h-5 w-5" />
      </button>
      <button type="button" aria-label="Scroll right" onClick={() => scrollBy(1)} className={cn(arrow, "-right-4", edges.end && "pointer-events-none opacity-0")}>
        <ChevronRight aria-hidden className="h-5 w-5" />
      </button>
    </div>
  );
}
