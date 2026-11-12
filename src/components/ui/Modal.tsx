"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const overlay =
  "fixed inset-0 z-overlay bg-overlay/60";

const panelVariants = cva(
  "fixed z-modal flex flex-col bg-surface text-text shadow-lg focus:outline-none",
  {
    variants: {
      kind: {
        modal: "left-1/2 top-1/2 max-h-screen w-full -translate-x-1/2 -translate-y-1/2 rounded-lg",
        drawer: "inset-y-0 h-full w-full max-w-drawer",
        sheet: "inset-x-0 bottom-0 max-h-screen rounded-t-xl",
      },
      side: { left: "left-0", right: "right-0", bottom: "" },
      size: { sm: "max-w-narrow", md: "max-w-modal", lg: "max-w-menu", full: "max-w-container" },
    },
    defaultVariants: { kind: "modal", size: "md" },
  },
);

type BaseProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional element that opens the dialog (wrapped with Radix Trigger asChild). */
  trigger?: ReactNode;
  title: string;
  /** Hide the visible title (kept for screen readers). */
  hideTitle?: boolean;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

function Frame({
  open,
  onOpenChange,
  trigger,
  title,
  hideTitle,
  description,
  footer,
  children,
  className,
  panel,
}: BaseProps & { panel: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className={overlay} />
        <Dialog.Content className={cn(panel, className)}>
          <div className={cn("flex items-center justify-between gap-4 border-b border-border px-4 py-3", hideTitle && "border-0 py-2")}>
            <Dialog.Title className={cn("font-heading text-xl font-semibold", hideTitle && "sr-only")}>{title}</Dialog.Title>
            <Dialog.Close
              className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus"
              aria-label="Close"
            >
              <X aria-hidden className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="px-4 pt-3 text-sm text-text-muted">{description}</Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer && <div className="border-t border-border px-4 py-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type ModalProps = BaseProps & Pick<VariantProps<typeof panelVariants>, "size">;

/** Centred dialog with focus trap, Escape to close and scroll lock. */
export function Modal({ size, ...props }: ModalProps) {
  return <Frame {...props} panel={panelVariants({ kind: "modal", size })} />;
}

export type DrawerProps = BaseProps & { side?: "left" | "right" | "bottom" };

/** Slide-in panel (cart, filters, mobile nav). `bottom` renders a mobile sheet. */
export function Drawer({ side = "right", ...props }: DrawerProps) {
  const panel =
    side === "bottom" ? panelVariants({ kind: "sheet", side, size: null }) : panelVariants({ kind: "drawer", side, size: null });
  return <Frame {...props} panel={panel} />;
}

export const DialogClose = Dialog.Close;
