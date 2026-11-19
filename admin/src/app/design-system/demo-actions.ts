"use server";

import type { ActionState } from "@/lib/admin/forms";

/** No-op server actions so admin forms can be previewed on the style guide without side effects. */
export async function demoFormAction(_prev: ActionState, _fd: FormData): Promise<ActionState> {
  return { message: "Style-guide preview: nothing was saved." };
}

export async function demoUploadAction(_fd: FormData): Promise<{ src?: string; error?: string }> {
  return { error: "Style-guide preview: uploads are disabled here." };
}

export async function demoVoidAction(_fd: FormData): Promise<void> {
  /* style-guide preview: no-op */
}

/** Quick-action preview: "saves" instantly and echoes the change (nothing is stored). */
export async function demoQuickAction(id: string, op: string, value?: number | null) {
  return {
    ok: true as const,
    product: { id, stock: op === "soldout" ? 0 : (value ?? 10), isActive: op !== "hide", isNew: op === "new-on" ? true : op === "new-off" ? false : null, position: op === "position" ? (value ?? null) : null },
  };
}
