"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input, type InputProps } from "./Input";

/** Password field with a show/hide toggle (admin and customer sign-in). */
export function PasswordInput({ className, ...props }: Omit<InputProps, "type" | "leadingIcon">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative w-full">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-12", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={props.id}
        className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
      >
        {visible ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
      </button>
    </div>
  );
}
