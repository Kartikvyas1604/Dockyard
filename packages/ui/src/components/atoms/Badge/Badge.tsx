import { cn } from "../../../lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "accent" | "success" | "destructive";
}

const tones: Record<string, string> = {
  neutral: "border-border-strong text-foreground-muted",
  accent: "border-accent/50 text-accent",
  success: "border-success/40 text-success",
  destructive: "border-destructive/40 text-destructive",
};

/** Status signal — Shipped, Settled, Live. Mono small caps, hairline border. */
export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
