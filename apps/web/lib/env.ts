/** Centralized env access. NEXT_PUBLIC_* is inlined at build time. */

function boolFlag(v: string | undefined): boolean {
  return v === "1" || v === "true";
}

export const env = {
  demoFork: boolFlag(process.env.NEXT_PUBLIC_DEMO_FORK),
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "1"),
} as const;
