import { DeskShell } from "@/components/desk/desk-shell";
import { ShipForm } from "@/components/desk/ship-form";
import { FeeMirrorPanel } from "@/components/desk/fee-mirror-panel";
import { StatusLog } from "@/components/desk/status-log";
import { Toasts } from "@/components/desk/toasts";

export const metadata = {
  title: "Desk — Dockyard",
};

export default function DeskPage() {
  return (
    <DeskShell>
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-px bg-border p-0 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
        <aside className="reveal reveal-1 hidden flex-col gap-1 border-r border-border bg-background p-4 lg:flex">
          <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-foreground-faint">
            Maker&apos;s desk
          </p>
          <p className="text-[11px] leading-relaxed text-foreground-muted">
            Strategies pull liquidity from your wallet balances — Aqua virtual balances, no
            deposit vault. A position is an{" "}
            <abbr title="Aqua strategy" className="cursor-help underline decoration-dotted">
              Aqua strategy
            </abbr>
            .
          </p>
          <div className="mt-auto space-y-1 font-mono text-[10px] text-foreground-faint">
            <p>AquaRouter 0x1111…a90a</p>
            <p>AquaSwapVMRouter 0x1111…c0de</p>
          </div>
        </aside>

        <div className="reveal reveal-2 min-w-0 space-y-px bg-border">
          <div className="bg-background">
            <ShipForm />
          </div>
          <div className="bg-background">
            <StatusLog />
          </div>
        </div>

        <div className="reveal reveal-3 bg-background">
          <FeeMirrorPanel />
        </div>
      </div>
      <Toasts />
    </DeskShell>
  );
}
