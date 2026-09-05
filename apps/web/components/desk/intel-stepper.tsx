"use client";

import { CircleDashed, Stamp, LoaderCircle, BadgeCheck } from "lucide-react";
import { Button, Panel, Badge } from "@dockyard/ui";
import { useDeskStore } from "@dockyard/store";
import { useIntelPurchase } from "@dockyard/hooks";

const STEPS = [
  { key: "402", label: "402", blurb: "Payment required" },
  { key: "paying", label: "paying", blurb: "Hedera testnet transit" },
  { key: "settled", label: "settled", blurb: "Facilitator stamped" },
  { key: "applied", label: "applied", blurb: "Values in ship form" },
] as const;

/**
 * x402 status stepper — a manifest being stamped:
 * 402 → paying → settled → applied. No fake settlement: if the
 * facilitator isn't configured, the 402 requirements are shown honestly.
 */
export function IntelStepper() {
  const { intel, setForm } = useDeskStore();
  const form = useDeskStore((s) => s.form);
  const buy = useIntelPurchase({
    base: form.tokenIn,
    quote: form.tokenOut,
    lookbackHours: 24,
  });

  const currentIndex = STEPS.findIndex((s) => s.key === intel.step);
  const active = currentIndex >= 0 ? intel.step : intel.intel ? "applied" : "idle";

  return (
    <Panel
      title="Pay intel — Hedera x402"
      meta="per-call"
      action={<Badge tone={active === "applied" ? "accent" : "neutral"}>{active}</Badge>}
    >
      <div className="space-y-6">
        <ol className="flex flex-col gap-0 sm:flex-row sm:items-stretch" aria-label="x402 payment steps">
          {STEPS.map((s, i) => {
            const stepIndex = STEPS.findIndex((x) => x.key === active);
            const done = stepIndex > i || (active === "applied" && s.key !== "402");
            const isCurrent = active === s.key;
            const isPaying = isCurrent && s.key === "paying";
            return (
              <li key={s.key} className="flex flex-1 items-center gap-2 sm:flex-col sm:gap-1.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center border font-mono text-[10px] uppercase ${
                    done || isCurrent
                      ? isPaying
                        ? "border-accent/60 text-accent motion-safe:animate-pulse"
                        : "border-accent bg-accent text-accent-foreground"
                      : "border-border-strong text-foreground-faint"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {done ? (
                    <BadgeCheck className="h-4 w-4" aria-hidden />
                  ) : isPaying ? (
                    <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
                  ) : isCurrent ? (
                    <Stamp className="h-4 w-4" aria-hidden />
                  ) : (
                    <CircleDashed className="h-4 w-4" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-mono text-xs ${done || isCurrent ? "text-foreground" : "text-foreground-faint"}`}
                  >
                    {s.label}
                  </p>
                  <p className="hidden truncate text-[10px] text-foreground-muted sm:block">
                    {s.blurb}
                  </p>
                </div>
                {i < STEPS.length - 1 ? (
                  <div
                    aria-hidden
                    className={`hidden h-px flex-1 sm:block ${done ? "bg-accent/50" : "bg-border"}`}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        {intel.step === "failed" ? (
          <div role="alert" className="border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-destructive">Payment didn&apos;t settle</p>
            <p className="mt-1 text-xs text-foreground-muted">
              {intel.stepError ?? "The facilitator rejected the payment."} Nothing was spent.
            </p>
          </div>
        ) : null}

        {active === "402" && intel.intel === null ? (
          <p className="border-l-2 border-border-strong pl-3 text-[11px] leading-relaxed text-foreground-muted">
            Intel is metered: each call pays per-request over x402 on Hedera testnet. The 402
            response carries payment requirements — your wallet signs once, the facilitator
            settles, the same payload the FeeMirror used is returned.
          </p>
        ) : null}

        {intel.intel ? (
          <div className="border border-accent/40 bg-accent/5 p-3 font-mono text-xs">
            <p className="text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
              Settled payload
            </p>
            <p className="mt-1.5 text-accent">
              {intel.intel.recommendation.programKind} · {intel.intel.recommendation.feeBps} bps ·
              ticks {intel.intel.recommendation.tickLower ?? "—"} /{" "}
              {intel.intel.recommendation.tickUpper ?? "—"}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => void buy()}>
            Pay &amp; refresh intel
          </Button>
          {intel.intel ? (
            <Button
              variant="secondary"
              onClick={() => {
                setForm({
                  programKind: intel.intel!.recommendation.programKind,
                  feeBps: intel.intel!.recommendation.feeBps,
                });
                useDeskStore.getState().pushLog("push() — x402 intel folded into ship params");
                useDeskStore
                  .getState()
                  .pushToast({ kind: "info", message: "x402 intel applied to ship form" });
              }}
            >
              Fold into ship form
            </Button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
