import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint/error wrapper. Wire the control with id and aria-describedby={`${id}-desc`}. */
export function FormField({ id, label, hint, error, required, hideLabel, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-sm font-medium text-text", hideLabel && "sr-only")}>
        {label}
        {required && (
          <span aria-hidden className="text-error">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-desc`} role={error ? "alert" : undefined} className={cn("text-sm", error ? "text-error" : "text-text-muted")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
