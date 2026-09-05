import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Small-caps manifest header. */
  title: string;
  /** Mono metadata rendered right-aligned in the header (counts, timestamps). */
  meta?: ReactNode;
  /** Header action slot (button, badge). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Hairline-bordered panel. Panels separate by 1px gaps, not shadows —
 * structure over chrome. Generous internal padding, tight external spacing.
 */
export function Panel({ title, meta, action, className, children, ...rest }: PanelProps) {
  return (
    <section
      aria-label={title}
      className={cn("flex min-w-0 flex-col border border-border bg-surface", className)}
      {...rest}
    >
      <header className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
        <h2 className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-foreground-muted">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {meta ? <span className="font-mono text-[10px] text-foreground-faint">{meta}</span> : null}
          {action}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </section>
  );
}
