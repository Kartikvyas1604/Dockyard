/**
 * Dockyard design tokens — single source of truth.
 * Named for the shipyard: brass lantern accent, harbor-dark surfaces.
 * These numeric values are mirrored as CSS custom properties in apps/web/app/globals.css.
 */

export const colors = {
  // Base — harbor water at night
  background: "#0a0a0a",
  surface: "#111111",
  surfaceRaised: "#161616",
  surfaceSunken: "#0d0d0d",

  // Hairline borders — structure, not shadow
  border: "#1f1f1f",
  borderStrong: "#2e2e2e",

  // Ink
  foreground: "#ececec",
  foregroundMuted: "#8f8f8f",
  foregroundFaint: "#5c5c5c",

  // The one accent — brass / lantern. Signal only, never decoration.
  accent: "#f5a524",
  accentMuted: "#8a5f14",
  accentForeground: "#0a0a0a",

  // Semantics (used sparingly, always carry meaning)
  success: "#4ade80",
  destructive: "#f87171",
} as const;

/** Hairline panel radius — structure over chrome. */
export const radii = {
  none: "0px",
  panel: "2px",
} as const;

export type Colors = typeof colors;
