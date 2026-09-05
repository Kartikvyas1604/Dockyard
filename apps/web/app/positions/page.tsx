"use client";

import Link from "next/link";
import { Ship } from "lucide-react";
import { Badge, Button, Panel } from "@dockyard/ui";
import { timeAgo } from "@dockyard/utils";
import { useDeskStore } from "@dockyard/store";

/** Positions — the maker's strategyHash ledger with virtual balances and SLR. */
export default function PositionsPage() {
  const positions = useDeskStore((s) => s.positions);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="reveal reveal-1 mb-4 max-w-prose">
        <h1 className="font-display text-2xl tracking-tight">Positions</h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
          Every row is a shipped Aqua strategy, identified by its immutable hash — changing
          params means <code className="font-mono text-xs text-foreground">dock()</code> then
          ship new.
        </p>
      </div>

      <div className="reveal reveal-2">
        <Panel title="Strategy ledger" meta={`${positions.length} rows`}>
          {positions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Ship className="h-10 w-10 text-foreground-faint" aria-hidden />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nothing shipped yet</p>
                <p className="max-w-sm text-xs leading-relaxed text-foreground-muted">
                  Once you ship a strategy from the desk, its hash and virtual balances land
                  here.
                </p>
              </div>
              <Link href="/desk">
                <Button variant="secondary" size="sm">
                  Open the desk
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <caption className="sr-only">Shipped strategies with virtual balances</caption>
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-foreground-faint">
                    <th scope="col" className="py-2 pr-4 font-medium">strategyHash</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Program</th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">Virtual balances</th>
                    <th scope="col" className="py-2 font-medium">SLR</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {positions.map((p) => (
                    <tr key={p.strategyHash} className="ledger-row align-top">
                      <td className="py-2.5 pr-4" title={p.strategyHash}>
                        {p.strategyHash.slice(0, 14)}…{p.strategyHash.slice(-6)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge tone={p.status === "shipped" ? "accent" : "neutral"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-foreground-muted">{p.programKind}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        {Object.entries(p.virtualBalances).map(([token, amt]) => (
                          <div key={token} className="tabular-nums text-foreground">
                            {amt} <span className="text-foreground-faint">{token}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-2.5 text-[11px] leading-snug text-foreground-muted">
                        <SlrBlurb kind={p.programKind} />
                        <div className="mt-0.5 text-foreground-faint">{timeAgo(p.shippedAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

/** Shared Liquidity Ratio — one balance backing many strategies. */
function SlrBlurb({ kind }: { kind: string }) {
  return kind === "XYCConcentrate" ? (
    <>
      Concentrated share: the same wallet balance can back this and other strategies — SLR
      &gt; 1 when ranges don&apos;t overlap.
    </>
  ) : (
    <>
      Full-range share: balance backs this strategy 1:1 until other strategies share it — SLR
      = 1.
    </>
  );
}
