"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useDeskStore } from "@dockyard/store";

const icons = {
  shipped: CheckCircle2,
  docked: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const tones = {
  shipped: "border-accent/60 text-accent",
  docked: "border-success/50 text-success",
  error: "border-destructive/50 text-destructive",
  info: "border-border-strong text-foreground",
} as const;

/** Status toasts — ship/dock/402 feedback. Dismissible, auto-expiring. */
export function Toasts() {
  const { toasts, dismissToast } = useDeskStore();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} id={t.id} onDismiss={dismissToast}>
          <div className={`flex items-start gap-2 border bg-surface p-3 ${tones[t.kind]}`}>
            {(() => {
              const Icon = icons[t.kind];
              return <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />;
            })()}
            <p className="font-mono text-xs leading-relaxed text-foreground">{t.message}</p>
          </div>
        </ToastRow>
      ))}
    </div>
  );
}

function ToastRow({
  id,
  onDismiss,
  children,
}: {
  id: number;
  onDismiss: (id: number) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      role="status"
      className="reveal pointer-events-auto"
    >
      {children}
    </div>
  );
}
