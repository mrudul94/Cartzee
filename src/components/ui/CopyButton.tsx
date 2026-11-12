"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type CopyButtonProps = { value: string; label: string; className?: string };

/** Copies `value` to the clipboard; announces success. `label` names what is copied (for screen readers). */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-border-strong bg-surface px-2 text-sm text-text hover:bg-background focus-visible:outline-none focus-visible:shadow-focus",
        className,
      )}
    >
      {copied ? <Check aria-hidden className="h-4 w-4 text-success" /> : <Copy aria-hidden className="h-4 w-4" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
