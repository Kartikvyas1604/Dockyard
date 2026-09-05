"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@dockyard/ui";
import { WalletButton } from "./wallet-button";
import { DemoBanner } from "./demo-banner";

const links = [
  { href: "/desk", label: "Desk" },
  { href: "/intel", label: "Intel" },
  { href: "/positions", label: "Positions" },
];

export function DeskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <header className="reveal reveal-1 flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border px-4">
        <div className="flex items-baseline gap-6">
          <Link href="/" className="font-display text-lg tracking-tight text-foreground">
            Dockyard
          </Link>
          <nav aria-label="Desk navigation" className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors duration-100 ease-out",
                    active
                      ? "border-accent/60 text-accent"
                      : "border-transparent text-foreground-muted hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <WalletButton />
      </header>
      <main className="flex-1 blueprint-grid">{children}</main>
    </div>
  );
}
