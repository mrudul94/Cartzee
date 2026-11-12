"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CheckboxProps = {
  id: string;
  label: ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

const row = "flex min-h-11 cursor-pointer items-center gap-3 text-base text-text";

export function Checkbox({ id, label, checked, onCheckedChange, disabled, className }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn(row, disabled && "cursor-not-allowed opacity-60", className)}>
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus data-[state=checked]:border-ink data-[state=checked]:bg-ink"
      >
        <CheckboxPrimitive.Indicator>
          <Check aria-hidden className="h-4 w-4 text-text-inverse" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span>{label}</span>
    </label>
  );
}

export type RadioGroupProps = {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: ReactNode }[];
  label?: string;
  className?: string;
};

export function RadioGroup({ name, value, onValueChange, options, label, className }: RadioGroupProps) {
  return (
    <RadioPrimitive.Root
      name={name}
      value={value}
      onValueChange={onValueChange}
      aria-label={label}
      className={cn("flex flex-col", className)}
    >
      {options.map((o) => {
        const id = `${name}-${o.value}`;
        return (
          <label key={o.value} htmlFor={id} className={row}>
            <RadioPrimitive.Item
              id={id}
              value={o.value}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface focus-visible:outline-none focus-visible:shadow-focus data-[state=checked]:border-ink"
            >
              <RadioPrimitive.Indicator className="h-2 w-2 rounded-full bg-ink" />
            </RadioPrimitive.Item>
            <span>{o.label}</span>
          </label>
        );
      })}
    </RadioPrimitive.Root>
  );
}
