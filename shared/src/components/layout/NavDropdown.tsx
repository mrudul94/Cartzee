"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type NavDropdownProps = {
  label: string;
  children: ReactNode;
  /** "mega" spans the header width; "menu" anchors under the trigger. */
  panel?: "mega" | "menu";
  /** "menu" panels: open from the trigger's left edge (default) or right edge (items near the screen's right). */
  align?: "left" | "right";
  /** Extra classes for the trigger button (e.g. a highlighted item). */
  triggerClassName?: string;
  className?: string;
};

/**
 * Disclosure-pattern nav dropdown: opens on hover (pointer) or click/Enter, closes on
 * Escape, outside click, focus leaving, or route change. Panel content is regular links.
 */
export function NavDropdown({ label, children, panel = "menu", align = "left", triggerClassName, className }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const enter = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={root}
      className={cn(panel === "menu" && "relative", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && enter()}
      onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
      onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-3 text-base font-medium text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus",
          open && panel === "mega" && "bg-secondary/60",
          triggerClassName,
        )}
      >
        {label}
        <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform duration-fast", open && "rotate-180")} />
      </button>
      <div
        id={id}
        hidden={!open}
        className={cn(
          "absolute z-dropdown border border-border bg-surface shadow-lg",
          panel === "mega" ? "inset-x-0 top-full border-x-0" : cn("top-full mt-1 min-w-64 rounded-md", align === "right" ? "right-0" : "left-0"),
        )}
      >
        {children}
      </div>
    </div>
  );
}
