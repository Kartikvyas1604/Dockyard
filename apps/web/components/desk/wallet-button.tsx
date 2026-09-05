"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { Anchor } from "lucide-react";
import { Button } from "@dockyard/ui";
import { shortHash } from "@dockyard/utils";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [open, setOpen] = useState(false);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground-faint sm:inline-block">
          chain {chainId}
        </span>
        <span
          className="border border-border-strong bg-surface-sunken px-2 py-1 font-mono text-xs text-foreground"
          title={address}
        >
          {shortHash(address)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="primary"
        size="sm"
        leading={<Anchor className="h-3.5 w-3.5" aria-hidden />}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        Connect wallet
      </Button>
      {open ? (
        <div
          role="dialog"
          aria-label="Connect wallet"
          className="absolute right-0 top-full z-40 mt-2 w-64 border border-border bg-surface p-3"
        >
          <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
            Dock your wallet
          </p>
          <div className="space-y-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="secondary"
                className="w-full justify-start"
                loading={isPending}
                onClick={() => connect({ connector }, { onSuccess: () => setOpen(false) })}
              >
                {connector.name}
              </Button>
            ))}
            {connectors.length === 0 ? (
              <p className="text-xs text-foreground-muted">
                No injected wallet found. Install MetaMask or a compatible wallet.
              </p>
            ) : null}
          </div>
          {error ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
