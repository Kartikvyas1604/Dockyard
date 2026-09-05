"use client";

import { useState, type FormEvent } from "react";
import { useAccount } from "wagmi";
import { keccak256, encodeAbiParameters, parseUnits } from "viem";
import { Button, Input, Label, Badge, Panel } from "@dockyard/ui";
import { validateNotional, validateTickRange } from "@dockyard/utils";
import { useDeskStore } from "@dockyard/store";
import type { ProgramKind } from "@dockyard/api";

const RISK_LINE =
  "Concentrated strategies take impermanent loss. Underfunded strategies stop filling. Allowances grant the routers spending rights — exact amounts, never unlimited.";

const programs: { kind: ProgramKind; blurb: string }[] = [
  { kind: "XYCConcentrate", blurb: "Concentrated range — tighter fills, more IL" },
  { kind: "XYC", blurb: "Full-range AMM — wider fills, less IL" },
];

/**
 * Desk ship form. `ship()` is stubbed at the hash layer — wiring
 * @1inch/aqua-sdk Program encode + AquaSwapVMRouter.ship() is the Day-2 task;
 * the hash below matches keccak256(abi.encode(strategy)) so the UI contract
 * is already correct.
 */
export function ShipForm() {
  const { address } = useAccount();
  const { form, setForm, pushToast, pushLog, addPosition } = useDeskStore();
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [shipping, setShipping] = useState(false);
  const [dockHash, setDockHash] = useState("");
  const [dockError, setDockError] = useState<string | null>(null);

  const concentrated = form.programKind === "XYCConcentrate";

  function validate(): boolean {
    const next: Record<string, string | null> = {
      notional: validateNotional(form.notional),
      ticks: concentrated
        ? validateTickRange(Number(form.tickLower), Number(form.tickUpper))
        : null,
    };
    setErrors(next);
    const firstInvalid = Object.entries(next).find(([, v]) => v !== null);
    if (firstInvalid) return false;
    return true;
  }

  async function onShip(e: FormEvent) {
    e.preventDefault();
    if (!address) {
      pushToast({ kind: "error", message: "Connect a wallet before shipping" });
      return;
    }
    if (!validate()) return;

    setShipping(true);
    pushLog(`quote() ok — ${form.notional} notional`);
    // TODO(Day 2): encode SwapVM Program via @1inch/aqua-sdk + allow to AQUA_ROUTER, then
    // AQUA_SWAPVM_ROUTER.ship(strategy, virtualBalances…). Hash computed identically below.
    await new Promise((r) => setTimeout(r, 400));

    const tickLower = Number(form.tickLower);
    const tickUpper = Number(form.tickUpper);
    const strategyHash = keccak256(
      encodeAbiParameters(
        [
          { type: "string" },
          { type: "uint24" },
          { type: "int24" },
          { type: "int24" },
          { type: "uint256" },
          { type: "address" },
        ],
        [
          form.programKind,
          form.feeBps,
          concentrated ? tickLower : 0,
          concentrated ? tickUpper : 0,
          parseUnits(form.notional || "0", 18),
          address,
        ],
      ),
    );

    addPosition({
      strategyHash,
      status: "shipped",
      virtualBalances: {
        [shortAddr(form.tokenIn)]: form.notional,
        [shortAddr(form.tokenOut)]: form.notional,
      },
      shippedAt: Date.now(),
      programKind: form.programKind,
    });
    pushLog(`ship() → ${strategyHash.slice(0, 14)}…`);
    pushToast({ kind: "shipped", message: `Strategy shipped — ${strategyHash.slice(0, 10)}…` });
    setShipping(false);
  }

  function onDock() {
    const { dockPosition, pushToast, pushLog } = useDeskStore.getState();
    if (!dockHash) {
      setDockError("Paste the strategyHash to dock");
      return;
    }
    setDockError(null);
    if (dockPosition(dockHash)) {
      pushLog(`dock() → ${dockHash.slice(0, 14)}…`);
      pushToast({ kind: "docked", message: "Strategy docked — liquidity pulled back" });
      setDockHash("");
    } else {
      setDockError("No shipped strategy with that hash in this session");
    }
  }

  return (
    <Panel
      title="Ship strategy"
      meta={
        <Badge tone={form.suggestedBy === "manual" ? "neutral" : "accent"}>
          params: {form.suggestedBy}
        </Badge>
      }
    >
      <form onSubmit={onShip} className="space-y-6" noValidate>
        <fieldset className="space-y-4">
          <legend className="sr-only">Token pair</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="token-in" hint="base">
                Token in
              </Label>
              <Input
                id="token-in"
                value={form.tokenIn}
                onChange={(e) => setForm({ tokenIn: e.target.value })}
                placeholder="0x…"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="token-out" hint="quote">
                Token out
              </Label>
              <Input
                id="token-out"
                value={form.tokenOut}
                onChange={(e) => setForm({ tokenOut: e.target.value })}
                placeholder="0x…"
                className="text-xs"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
            Program kind
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {programs.map((p) => (
              <button
                key={p.kind}
                type="button"
                aria-pressed={form.programKind === p.kind}
                onClick={() => setForm({ programKind: p.kind })}
                className={`border px-3 py-2 text-left transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  form.programKind === p.kind
                    ? "border-accent/60 bg-accent/5"
                    : "border-border-strong hover:border-foreground-faint"
                }`}
              >
                <span
                  className={`block font-mono text-xs ${form.programKind === p.kind ? "text-accent" : "text-foreground"}`}
                >
                  {p.kind}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-foreground-muted">
                  {p.blurb}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="fee-bps" hint="bps">
              Fee
            </Label>
            <Input
              id="fee-bps"
              inputMode="numeric"
              value={String(form.feeBps)}
              onChange={(e) => setForm({ feeBps: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tick-lower" hint={concentrated ? "int24" : "XYC only"}>
              Tick lower
            </Label>
            <Input
              id="tick-lower"
              inputMode="numeric"
              value={form.tickLower}
              disabled={!concentrated}
              onChange={(e) => setForm({ tickLower: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tick-upper" hint={concentrated ? "int24" : "XYC only"}>
              Tick upper
            </Label>
            <Input
              id="tick-upper"
              inputMode="numeric"
              value={form.tickUpper}
              disabled={!concentrated}
              onChange={(e) => setForm({ tickUpper: e.target.value })}
            />
          </div>
        </div>
        {errors.ticks ? (
          <p id="ticks-error" className="text-xs text-destructive" role="alert">
            {errors.ticks}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="notional" hint="per token">
            Notional
          </Label>
          <Input
            id="notional"
            inputMode="decimal"
            value={form.notional}
            invalid={Boolean(errors.notional)}
            aria-invalid={errors.notional ? "true" : undefined}
            aria-describedby={errors.notional ? "notional-error" : undefined}
            onChange={(e) => setForm({ notional: e.target.value })}
            placeholder="1250.00"
          />
          {errors.notional ? (
            <p id="notional-error" className="text-xs text-destructive" role="alert">
              {errors.notional}
            </p>
          ) : null}
        </div>

        <p className="border-l-2 border-border-strong pl-3 text-[11px] leading-relaxed text-foreground-muted">
          {RISK_LINE}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" loading={shipping} disabled={!address}>
            Ship
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => useDeskStore.getState().resetForm()}
          >
            Reset
          </Button>
          {!address ? (
            <span className="text-[11px] text-foreground-muted">Wallet required to ship</span>
          ) : null}
        </div>

        <div className="border-t border-border pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="dock-hash" hint="keccak256(abi.encode(strategy))">
              Dock existing strategy
            </Label>
            <div className="flex gap-2">
              <Input
                id="dock-hash"
                value={dockHash}
                invalid={Boolean(dockError)}
                onChange={(e) => setDockHash(e.target.value)}
                placeholder="0x…"
                className="text-xs"
                aria-describedby={dockError ? "dock-error" : undefined}
              />
              <Button type="button" variant="danger" onClick={onDock}>
                Dock
              </Button>
            </div>
            {dockError ? (
              <p id="dock-error" className="text-xs text-destructive" role="alert">
                {dockError}
              </p>
            ) : null}
          </div>
        </div>
      </form>
    </Panel>
  );
}

function shortAddr(a: string): string {
  return a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}
