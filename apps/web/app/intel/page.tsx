import { DeskShell } from "@/components/desk/desk-shell";
import { IntelStepper } from "@/components/desk/intel-stepper";
import { Toasts } from "@/components/desk/toasts";

export const metadata = {
  title: "Intel — Dockyard",
};

export default function IntelPage() {
  return (
    <DeskShell>
      <div className="mx-auto max-w-3xl space-y-px p-4 sm:p-6 lg:p-8">
        <div className="reveal reveal-1 mb-4 max-w-prose">
          <h1 className="font-display text-2xl tracking-tight">Strategy Intel</h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
            Cross-protocol fee/volume intel composed from The Graph standardized DEX
            subgraphs — bought per call over Hedera x402. One request, one payment, the same
            payload an agent would receive.
          </p>
        </div>
        <div className="reveal reveal-2">
          <IntelStepper />
        </div>
      </div>
      <Toasts />
    </DeskShell>
  );
}
