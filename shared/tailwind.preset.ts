import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import {
  aspect,
  borderWidth,
  breakpoint,
  color,
  cssVariables,
  duration,
  easing,
  font,
  kebab,
  maxWidth,
  radius,
  shadow,
  space,
  zIndex,
} from "./src/design-system/tokens";

/**
 * Theme keys are REPLACED (not extended) by design tokens, so default Tailwind
 * palettes and sizes are unavailable — only tokens can be used.
 * Every value points at a CSS variable emitted from tokens.ts.
 */
const colorVars = Object.fromEntries(
  Object.keys(color).map((k) => [kebab(k), `rgb(var(--color-${kebab(k)}) / <alpha-value>)`]),
);
const spaceVars = Object.fromEntries(
  Object.keys(space).map((k) => [k, `var(--space-${String(k).replace(".", "_")})`]),
);
const radiusVars = Object.fromEntries(Object.keys(radius).map((k) => [k, `var(--radius-${k})`]));
const shadowVars = Object.fromEntries(Object.keys(shadow).map((k) => [k, `var(--shadow-${k})`]));

/** Shared Tailwind preset: both apps add their own `content` globs. */
const preset: Config = {
  content: [],
  theme: {
    screens: breakpoint,
    colors: { transparent: "transparent", current: "currentColor", ...colorVars },
    spacing: spaceVars,
    fontFamily: { heading: [font.family.heading], body: [font.family.body] },
    fontSize: Object.fromEntries(
      Object.entries(font.size).map(([k, [, lh]]) => [k, [`var(--text-${k})`, { lineHeight: lh }]]),
    ),
    fontWeight: font.weight,
    lineHeight: font.lineHeight,
    letterSpacing: font.tracking,
    borderRadius: radiusVars,
    borderWidth,
    boxShadow: shadowVars,
    zIndex: { ...zIndex, auto: "auto" },
    maxWidth: ({ theme }) => ({ ...theme("spacing"), ...maxWidth, full: "100%", none: "none" }),
    transitionDuration: { ...duration, DEFAULT: duration.base },
    transitionTimingFunction: { ...easing, DEFAULT: easing.standard },
    aspectRatio: { ...aspect, auto: "auto" },
    extend: {},
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({ ":root": cssVariables() });
    }),
  ],
};

export default preset;
