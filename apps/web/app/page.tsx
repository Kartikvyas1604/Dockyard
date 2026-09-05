import Link from "next/link";
import { DockMark } from "@/components/dock-mark";

export default function Landing() {
  return (
    <div className="harbor-horizon relative flex min-h-dvh flex-col">
      <div className="blueprint-grid pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative flex h-12 items-center justify-between border-b border-border px-4">
        <span className="flex items-center gap-2">
          <DockMark size={22} />
          <span className="font-display text-lg tracking-tight">Dockyard</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-faint">
          self-custodial · aqua swapvm · the graph · hedera x402
        </span>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Ship strategies, not vaults.
          </h1>
          <p className="mx-auto mt-6 max-w-prose text-base leading-relaxed text-foreground-muted">
            Dockyard is a self-custodial multi-strategy LP desk: ship 1inch Aqua SwapVM
            strategies straight from your wallet, steer ranges with The Graph data, and buy
            Strategy Intel per call over Hedera x402.
          </p>
          <div className="mt-8">
            <Link
              href="/desk"
              className="inline-flex h-11 items-center border border-accent/40 bg-accent px-6 font-mono text-sm uppercase tracking-wider text-accent-foreground transition-colors duration-100 ease-out hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open desk
            </Link>
          </div>
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-faint">
            ship() · dock() · pull() · push() · swap() · quote()
          </p>
        </div>
      </main>

      <footer className="relative border-t border-border px-4 py-3">
        <p className="text-center text-[11px] leading-relaxed text-foreground-muted">
          No deposit vault. No custody. No guaranteed yield. Your tokens stay in your wallet;
          Dockyard holds nothing.
        </p>
      </footer>
    </div>
  );
}
