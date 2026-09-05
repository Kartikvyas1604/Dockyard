"use client";

import { Button } from "@dockyard/ui";

/** Deck-wide error boundary — recovery, not a stack trace. */
export default function DeskError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-2xl tracking-tight">The deck hit rough water</p>
      <p className="max-w-prose text-sm leading-relaxed text-foreground-muted">
        Something broke on this screen. Your wallet and form state are untouched — retry the
        panel, or head back to the desk.
      </p>
      <Button variant="secondary" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
