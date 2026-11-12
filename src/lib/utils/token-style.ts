import type { CSSProperties } from "react";
import type { ColorToken, SpaceToken } from "@/design-system/tokens";
import { kebab } from "@/design-system/tokens";

export type SizeProp = SpaceToken | "auto" | "full";

const size = (v?: SizeProp) =>
  v === undefined ? undefined : v === "auto" ? "auto" : v === "full" ? "100%" : `var(--space-${String(v).replace(".", "_")})`;
const col = (v?: ColorToken) => (v ? `rgb(var(--color-${kebab(v)}))` : undefined);

/**
 * Turns token names into inline styles that reference token CSS variables.
 * Lets components accept `width="12"` / `color="success"` props without
 * raw values and without dynamic Tailwind class names.
 */
export function tokenStyle(o: { width?: SizeProp; height?: SizeProp; bg?: ColorToken; fg?: ColorToken }): CSSProperties {
  const s: CSSProperties = {};
  if (o.width !== undefined) s.width = size(o.width);
  if (o.height !== undefined) s.height = size(o.height);
  if (o.bg) s.backgroundColor = col(o.bg);
  if (o.fg) s.color = col(o.fg);
  return s;
}
