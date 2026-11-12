"use server";

import type { ActionState } from "@/lib/admin/forms";

/** No-op server actions so admin forms can be previewed on the style guide without side effects. */
export async function demoFormAction(_prev: ActionState, _fd: FormData): Promise<ActionState> {
  return { message: "Style-guide preview: nothing was saved." };
}

export async function demoUploadAction(_fd: FormData): Promise<{ src?: string; error?: string }> {
  return { error: "Style-guide preview: uploads are disabled here." };
}
