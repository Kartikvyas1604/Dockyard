"use client";

import { Panel } from "@dockyard/ui";
import { timeAgo } from "@dockyard/utils";
import { useDeskStore } from "@dockyard/store";

/** Lifecycle log — ship()/dock()/pull()/push()/swap()/quote() surfaced verbatim. */
export function StatusLog() {
  const logs = useDeskStore((s) => s.logs);

  return (
    <Panel title="Status log" meta={`${logs.length} events`}>
      {logs.length === 0 ? (
        <p className="py-6 text-center text-xs text-foreground-muted">
          Quiet deck. Events appear as you quote, approve, ship and dock.
        </p>
      ) : (
        <ul className="font-mono text-xs" aria-live="polite">
          {logs.map((l) => (
            <li key={l.id} className="ledger-row flex items-baseline justify-between gap-4 py-1.5">
              <span className="truncate text-foreground">{l.line}</span>
              <span className="shrink-0 tabular-nums text-foreground-faint">{timeAgo(l.ts)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
