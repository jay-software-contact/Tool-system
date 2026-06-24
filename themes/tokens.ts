/**
 * Design Tokens for the-System
 *
 * Centralised, data-only source for all visual primitives.
 * No React/runtime dependencies — importable from stories, tests,
 * CSS-in-JS configs, server helpers, or any other JS runtime.
 *
 * Every component that needs a value from the system imports from here
 * (or, at layout time, from ThemeContext which re-exports these).
 * Updating a single hex or rem in this file propagates everywhere.
 *
 * Conventions:
 *   - Colours are hex strings (#rrggbb) — theme presets map semantics to
 *     concrete hex values via ThemeContext.
 *   - Sizing / spacing is in rem (relative to root 16px unless overridden).
 *   - Font stacks are ordered preference lists.
 *   - Numbers are unit-integer px-equivalents where consumers need breakpoints
 *     or media-query comparisons.
 */

// ---- Font Families ----
export const fonts = {
  heading: "'Space Grotesk', 'DM Sans', sans-serif",
  body: "'DM Sans', 'Inter', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
};

// ---- Typography Scale (rem) ----
export const fontSizes = {
  xs: "0.6875rem",    // 11px
  sm: "0.75rem",      // 12px
  base: "0.875rem",   // 14px — default body
  md: "0.9375rem",    // 15px
  lg: "1rem",         // 16px
  xl: "1.125rem",     // 18px
  "2xl": "1.25rem",   // 20px
  "3xl": "1.5rem",    // 24px
  "4xl": "2rem",      // 32px
  "5xl": "2.5rem",    // 40px
};

// ---- Font Weights ----
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// ---- Line Heights ----
export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

// ---- Letter Spacing ----
export const letterSpacings = {
  tighter: "-0.04em",
  tight: "-0.02em",
  normal: "0em",
  wide: "0.03em",
  wider: "0.05em",
};

// ---- Spacing Scale (rem) ----
export const spacing = {
  0: "0rem",
  0.5: "0.125rem",   // 2px
  1: "0.25rem",      // 4px
  1.5: "0.375rem",   // 6px
  2: "0.5rem",       // 8px
  2.5: "0.625rem",   // 10px
  3: "0.75rem",      // 12px
  3.5: "0.875rem",   // 14px
  4: "1rem",         // 16px
  5: "1.25rem",      // 20px
  6: "1.5rem",       // 24px
  7: "1.75rem",      // 28px
  8: "2rem",         // 32px
  10: "2.5rem",      // 40px
  12: "3rem",        // 48px
  14: "3.5rem",      // 56px
  16: "4rem",        // 64px
  20: "5rem",        // 80px
  24: "6rem",        // 96px
  32: "8rem",        // 128px
};

// ---- Border Radius ----
export const radii = {
  none: "0",
  xs: "2px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  full: "9999px",
};

// ---- Border Widths ----
export const borderWidths = {
  none: "0",
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

// ---- Box Shadows ----
export const shadows = {
  none: "none",
  sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
  md: "0 4px 8px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)",
  xl: "0 16px 48px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)",
  accent: "0 0 0 1px var(--accent-glow, rgba(230, 168, 23, 0.15))",
  inset: "inset 0 1px 2px rgba(0, 0, 0, 0.4)",
};

// ---- Z-Index Scale ----
export const zIndices = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  max: 2147483647,
};

// ---- Transitions ----
export const transitions = {
  fast: "100ms ease",
  normal: "150ms ease",
  slow: "250ms ease",
  color: "color 150ms ease, background-color 150ms ease, border-color 150ms ease",
  transform: "transform 150ms ease",
  all: "all 150ms ease",
};

// ---- Breakpoints ----
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// ---- Component-Level Tokens ----
export const components = {
  button: {
    paddingX: spacing[3],
    paddingY: "0.3125rem",
    sm: { paddingX: spacing[2], paddingY: "0.1875rem", fontSize: fontSizes.xs },
    md: { paddingX: spacing[3], paddingY: "0.3125rem", fontSize: fontSizes.sm },
    lg: { paddingX: spacing[4], paddingY: "0.4375rem", fontSize: fontSizes.base },
  },
  input: {
    paddingX: spacing[3],
    paddingY: "0.375rem",
    fontSize: fontSizes.base,
    borderWidth: borderWidths.thin,
  },
  card: {
    padding: spacing[4],
    radius: radii.lg,
    borderWidth: borderWidths.thin,
  },
  badge: {
    paddingX: spacing[2],
    paddingY: spacing[0.5],
    fontSize: fontSizes.xs,
    radius: radii.full,
  },
  separator: {
    width: borderWidths.thin,
  },
  nav: {
    height: "3rem",
    paddingX: spacing[4],
  },
  sidebar: {
    widthCollapsed: "3rem",
    widthExpanded: "16rem",
  },
};

// ---- Semantic Colour Palette ----
export const colours = {
  amber: {
    50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
    400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
    800: "#92400e", 900: "#78350f",
  },
  teal: {
    50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4",
    400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e",
    800: "#115e59", 900: "#134e4a",
  },
  orange: {
    50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74",
    400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c",
    800: "#9a3412", 900: "#7c2d12",
  },
  red: { 400: "#f87171", 500: "#ef4444", 600: "#dc2626" },
  green: { 400: "#4ade80", 500: "#22c55e", 600: "#16a34a" },
  blue: { 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb" },
};

// ---- Master Tokens Export ----
export const tokens = {
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  spacing,
  radii,
  borderWidths,
  shadows,
  zIndices,
  transitions,
  breakpoints,
  components,
  colours,
};

export default tokens;
