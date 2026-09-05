export const typography = {
  /** Editorial authority — ship's manifest headers. */
  display: {
    family: "var(--font-newsreader), Georgia, serif",
    tracking: "-0.02em",
  },
  /** Verifiable data — addresses, hashes, fee bps, ticks. */
  mono: {
    family: "var(--font-jetbrains-mono), ui-monospace, monospace",
    tracking: "-0.01em",
  },
} as const;
