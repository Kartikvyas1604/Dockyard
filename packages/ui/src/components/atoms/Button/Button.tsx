import { forwardRef } from "react";
import { cn } from "../../../lib/cn";
import type { ButtonProps } from "./Button.props";

const variantClasses: Record<string, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent/90 border border-accent/40",
  secondary:
    "bg-surface-raised text-foreground hover:bg-surface border border-border-strong hover:border-accent/50",
  ghost:
    "bg-transparent text-foreground-muted hover:text-foreground hover:bg-surface-raised border border-transparent",
  danger:
    "bg-transparent text-destructive hover:bg-destructive/10 border border-destructive/40",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading = false, leading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap font-mono uppercase tracking-wider",
        "transition-colors duration-100 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-3 w-3 shrink-0 animate-spin rounded-full border border-current border-t-transparent"
        />
      ) : (
        leading
      )}
      {children}
    </button>
  );
});
