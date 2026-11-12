"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode };

export type AccordionProps = {
  items: AccordionItem[];
  /** "single" closes others when one opens. */
  type?: "single" | "multiple";
  defaultOpen?: string[];
  variant?: "plain" | "boxed";
  /** Heading level for item titles (keeps document outline valid). */
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
};

export function Accordion({ items, type = "multiple", defaultOpen = [], variant = "plain", headingLevel = "h3", className }: AccordionProps) {
  const itemClass = variant === "boxed" ? "rounded-md border border-border bg-surface px-4" : "border-b border-border";
  const H = headingLevel;
  const inner = items.map((item) => (
    <AccordionPrimitive.Item key={item.id} value={item.id} className={itemClass}>
      <AccordionPrimitive.Header asChild>
            <H className="m-0">
              <AccordionPrimitive.Trigger className="group flex min-h-11 w-full items-center justify-between gap-4 py-4 text-left font-body text-base font-semibold text-text focus-visible:outline-none focus-visible:shadow-focus">
                <span>{item.title}</span>
                <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-text-muted transition-transform duration-base group-data-[state=open]:rotate-180" />
              </AccordionPrimitive.Trigger>
            </H>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="pb-4 text-base leading-relaxed text-text-muted">{item.content}</AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ));

  const cls = cn("flex flex-col", variant === "boxed" && "gap-3", className);
  return type === "single" ? (
    <AccordionPrimitive.Root type="single" collapsible defaultValue={defaultOpen[0]} className={cls}>
      {inner}
    </AccordionPrimitive.Root>
  ) : (
    <AccordionPrimitive.Root type="multiple" defaultValue={defaultOpen} className={cls}>
      {inner}
    </AccordionPrimitive.Root>
  );
}

export type TabItem = { value: string; label: string; content: ReactNode };

export function Tabs({ items, defaultValue, className }: { items: TabItem[]; defaultValue?: string; className?: string }) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue ?? items[0]?.value} className={className}>
      <TabsPrimitive.List className="flex gap-1 overflow-x-auto border-b border-border" aria-label="Sections">
        {items.map((t) => (
          <TabsPrimitive.Trigger
            key={t.value}
            value={t.value}
            className="min-h-11 whitespace-nowrap border-b-2 border-transparent px-4 text-base font-medium text-text-muted transition-colors duration-fast hover:text-text focus-visible:outline-none focus-visible:shadow-focus data-[state=active]:border-ink data-[state=active]:text-text"
          >
            {t.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((t) => (
        <TabsPrimitive.Content key={t.value} value={t.value} className="pt-6 focus-visible:outline-none">
          {t.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
