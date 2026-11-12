import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { font } from "@/design-system/tokens";

/** tailwind-merge taught about our token names so overrides resolve correctly. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: Object.keys(font.size) }],
      "font-family": [{ font: ["heading", "body"] }],
      shadow: [{ shadow: ["none", "sm", "md", "lg", "focus"] }],
    },
  },
});

/** Merge conditional class names; later classes win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
