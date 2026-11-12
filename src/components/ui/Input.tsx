import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Shared field look for Input, Textarea and Select so they always match. */
export const fieldVariants = cva(
  "w-full rounded-md border bg-surface font-body text-base text-text transition-colors duration-fast placeholder:text-text-muted focus:border-primary focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-background disabled:opacity-70",
  {
    variants: {
      size: { sm: "h-9 px-3 text-sm", md: "h-11 px-4", lg: "h-12 px-4 text-lg" },
      invalid: { true: "border-error focus:border-error", false: "border-border-strong" },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

type FieldVariantProps = VariantProps<typeof fieldVariants>;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  FieldVariantProps & { leadingIcon?: ReactNode; ref?: Ref<HTMLInputElement> };

export function Input({ size, invalid, leadingIcon, className, ref, ...rest }: InputProps) {
  const input = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldVariants({ size, invalid }), leadingIcon && "pl-10", className)}
      {...rest}
    />
  );
  if (!leadingIcon) return input;
  return (
    <div className="relative w-full">
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
        {leadingIcon}
      </span>
      {input}
    </div>
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  Pick<FieldVariantProps, "invalid"> & { ref?: Ref<HTMLTextAreaElement> };

export function Textarea({ invalid, className, ref, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(fieldVariants({ invalid }), "h-auto py-3", className)}
      {...rest}
    />
  );
}

export type SelectOption = { value: string; label: string };
export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> &
  FieldVariantProps & { options: readonly SelectOption[]; placeholder?: string; ref?: Ref<HTMLSelectElement> };

/** Native select (best mobile UX + accessibility) with token styling. */
export function Select({ size, invalid, options, placeholder, className, ref, ...rest }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(fieldVariants({ size, invalid }), "appearance-none pr-10", className)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
}
