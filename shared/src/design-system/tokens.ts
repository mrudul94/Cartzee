/**
 * City Seller design tokens — the single source of truth for every visual value.
 *
 * Flow: tokens.ts → (tailwind.config.ts plugin) → CSS custom properties on :root
 *       → Tailwind theme keys that read those variables.
 * Components may only use Tailwind classes generated from these tokens.
 * Changing a value here updates the whole site.
 *
 * Colour rule 60-30-10: background/surface (60) · secondary (30) · primary CTA (10).
 *
 * Accessibility notes (WCAG AA, white text on colour):
 *  - Brief asked for primary #C8553D; white on it is 4.35:1 (fails AA for 16px text).
 *    We use the nearest passing shade #B84A33 (5.17:1). `brandRaw` keeps the original
 *    for decorative use only (never behind text).
 *  - `textMuted` passes on background/surface (5.3:1) but NOT on `secondary` — use `text` there.
 */

export const color = {
  background: "#FAF7F2",
  surface: "#FFFFFF",
  secondary: "#E8DED1",
  secondaryStrong: "#D9CBB8",
  text: "#2B2A28",
  textMuted: "#6B6660",
  textInverse: "#FFFFFF",
  primary: "#B84A33",
  primaryHover: "#9E3F2B",
  primarySoft: "#F6E3DD",
  brandRaw: "#C8553D",
  /** Star fill (decorative; ratings always have a text label). */
  rating: "#D99A00",
  success: "#2E7D32",
  successSoft: "#E3F1E4",
  warning: "#8F5600",
  warningSoft: "#FBEFD9",
  error: "#B3261E",
  errorSoft: "#F9E1DF",
  border: "#DDD3C5",
  borderStrong: "#BFB2A1",
  ink: "#2B2A28",
  overlay: "#1A1917",
} as const;

export const font = {
  family: {
    heading: "var(--font-heading), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    body: "var(--font-body), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  /** [font-size, line-height] — body text never below `base` (16px). */
  size: {
    xs: ["0.75rem", "1.5"],
    sm: ["0.875rem", "1.5"],
    base: ["1rem", "1.6"],
    lg: ["1.125rem", "1.6"],
    xl: ["1.25rem", "1.5"],
    "2xl": ["1.5rem", "1.35"],
    "3xl": ["1.875rem", "1.25"],
    "4xl": ["2.25rem", "1.2"],
    "5xl": ["3rem", "1.1"],
  },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
  lineHeight: { tight: "1.2", snug: "1.35", normal: "1.5", relaxed: "1.6" },
  tracking: { tight: "-0.01em", normal: "0", wide: "0.04em", wider: "0.08em" },
} as const;

/**
 * Spacing: 8px rhythm (4, 8, 12, 16, 24, 32, 48, 64) plus layout sizes used for
 * control heights (36/44/48/56), icons and media boxes. Keys follow Tailwind (1 = 4px).
 */
export const space = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  64: "16rem",
  80: "20rem",
  96: "24rem",
} as const;

export const maxWidth = {
  container: "80rem",
  prose: "65ch",
  narrow: "40rem",
  drawer: "26rem",
  modal: "32rem",
  menu: "60rem",
} as const;

export const radius = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const shadow = {
  none: "none",
  sm: "0 1px 2px 0 rgb(43 42 40 / 0.06)",
  md: "0 4px 12px -2px rgb(43 42 40 / 0.10)",
  lg: "0 12px 32px -8px rgb(43 42 40 / 0.18)",
  focus: "0 0 0 3px rgb(184 74 51 / 0.35)",
} as const;

export const borderWidth = { 0: "0", DEFAULT: "1px", 2: "2px" } as const;

export const zIndex = {
  base: "0",
  raised: "10",
  dropdown: "20",
  sticky: "30",
  overlay: "40",
  modal: "50",
  toast: "60",
} as const;

export const breakpoint = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const duration = { fast: "150ms", base: "200ms", slow: "300ms", slide: "500ms" } as const;
export const easing = { standard: "cubic-bezier(0.2, 0, 0, 1)" } as const;

export const aspect = {
  square: "1 / 1",
  product: "1 / 1",
  banner: "16 / 9",
  /** Homepage hero artwork (1792 × 768). */
  hero: "7 / 3",
  wide: "3 / 1",
  tile: "4 / 5",
} as const;

export const tokens = {
  color,
  font,
  space,
  maxWidth,
  radius,
  shadow,
  borderWidth,
  zIndex,
  breakpoint,
  duration,
  easing,
  aspect,
} as const;

export type ColorToken = keyof typeof color;
export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;

/** Kebab-case helper shared by the Tailwind plugin and the style-guide page. */
export const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** "#B84A33" → "184 74 51" so Tailwind opacity modifiers (bg-primary/50) work. */
export const hexToRgbChannels = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ");
};

/** All CSS custom properties derived from tokens. */
export function cssVariables(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(color)) vars[`--color-${kebab(k)}`] = hexToRgbChannels(v);
  for (const [k, v] of Object.entries(space)) vars[`--space-${String(k).replace(".", "_")}`] = v;
  for (const [k, v] of Object.entries(radius)) vars[`--radius-${k}`] = v;
  for (const [k, v] of Object.entries(shadow)) vars[`--shadow-${k}`] = v;
  for (const [k, v] of Object.entries(duration)) vars[`--duration-${k}`] = v;
  for (const [k, [size]] of Object.entries(font.size)) vars[`--text-${k}`] = size;
  return vars;
}
