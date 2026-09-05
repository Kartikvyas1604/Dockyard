"use client";

import { env } from "@/lib/env";

/**
 * Demo mode banner — shown when NEXT_PUBLIC_DEMO_FORK=1.
 * Gives judges the fork-fill instructions inline.
 */
export function DemoBanner() {
  if (!env.demoFork) return null;

  return (
    <div
      role="note"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-accent/40 bg-accent/5 px-4 py-2 font-mono text-[11px] text-accent"
    >
      <span className="uppercase tracking-[0.14em]">Demo fork mode</span>
      <span className="text-foreground-muted">
        Taker fills run against a local fork —{" "}
        <code className="text-foreground">anvil --fork-url $RPC</code>, then{" "}
        <code className="text-foreground">forge script ForkFill</code> to call{" "}
        <code className="text-foreground">swap()</code> / <code className="text-foreground">quote()</code> as taker.
        Production fills are resolver-gated.
      </span>
    </div>
  );
}
