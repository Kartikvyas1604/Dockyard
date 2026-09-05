"use client";

import { useMemo } from "react";
import { RefreshCw, ArrowDownToLine } from "lucide-react";
import { Button, Badge, Panel } from "@dockyard/ui";
import { fmtUsd } from "@dockyard/utils";
import { useIntelPreview } from "@dockyard/hooks";
import { useDeskStore } from "@dockyard/store";

/**
 * FeeMirror — live The Graph standardized-DEX fee/volume intel.
 * One query pattern → N protocol deployments (Messari standardized schema).
 * "Apply to ship form" writes the recommendation into the desk form.
 */
export function FeeMirrorPanel() {
  const { form } = useDeskStore();
  const { applyIntel, pushToast, pushLog } = useDeskStore();

  const req = useMemo(
    () => ({ base: form.tokenIn, quote: form.tokenOut, lookbackHours: 24 }),
    [form.tokenIn, form.tokenOut],
  );
  const { status, data, error, refresh } = useIntelPreview(req);

  return (
    <Panel
      title="FeeMirror"
      meta={data ? `as of ${data.asOf.slice(11, 16)}Z` : "24h lookback"}
      action={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refresh()}
          aria-label="Refresh fee intel"
          loading={status === "loading"}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Refresh
        </Button>
      }
      className="min-h-[420px]"
    >
      {status === "loading" ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse bg-surface-sunken" />
          ))}
        </div>
      ) : status === "error" ? (
        <div className="space-y-3">
          <div className="border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-destructive">Couldn&apos;t load fee intel</p>
            <p className="mt-1 text-xs text-foreground-muted">
              {error ?? "The Graph query failed."} Standardized subgraphs must be configured
              (GRAPH_SUBGRAPH_URLS) for live data — no mocks on the demo path.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void refresh()}>
            Try again
          </Button>
        </div>
      ) : status === "ready" && data ? (
        <div className="space-y-4">
          <table className="w-full text-left">
            <caption className="sr-only">
              24h fees and volume by protocol, standardized DEX subgraphs
            </caption>
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-[0.12em] text-foreground-faint">
                <th scope="col" className="py-1.5 font-medium">Protocol</th>
                <th scope="col" className="py-1.5 text-right font-medium">Fees 24h</th>
                <th scope="col" className="py-1.5 text-right font-medium">Volume 24h</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {data.sources.map((s) => (
                <tr key={s.subgraph} className="ledger-row">
                  <td className="py-2 pr-2 text-foreground">{s.protocol}</td>
                  <td className="py-2 text-right tabular-nums text-foreground">
                    {fmtUsd(s.feeUsd24h)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-foreground-muted">
                    {fmtUsd(s.volumeUsd24h)}
                  </td>
                </tr>
              ))}
              {data.sources.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center font-sans text-xs text-foreground-muted">
                    No deployments reported for this pair yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <div className="border border-accent/40 bg-accent/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                Recommendation
              </span>
              <Badge tone="accent">{data.recommendation.programKind}</Badge>
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-foreground-faint">Fee</dt>
                <dd className="tabular-nums text-accent">{data.recommendation.feeBps} bps</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-foreground-faint">Tick lower</dt>
                <dd className="tabular-nums text-foreground">
                  {data.recommendation.tickLower ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-foreground-faint">Tick upper</dt>
                <dd className="tabular-nums text-foreground">
                  {data.recommendation.tickUpper ?? "—"}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground-muted">
              {data.recommendation.rationale}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3 w-full"
              leading={<ArrowDownToLine className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => {
                applyIntel(data, "graph");
                pushLog("pull() — FeeMirror params written to ship form");
                pushToast({ kind: "info", message: "Graph params applied to ship form" });
              }}
            >
              Apply to ship form
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
