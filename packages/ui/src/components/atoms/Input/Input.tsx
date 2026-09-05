import { forwardRef } from "react";
import { cn } from "../../../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Ledger-style input: mono, right-alignable numerics, hairline border.
 * Always pair with a <Label htmlFor>. Pass type/inputmode per field.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      spellCheck={false}
      className={cn(
        "h-10 w-full border bg-surface-sunken px-3 font-mono text-sm text-foreground",
        "placeholder:text-foreground-faint",
        "transition-colors duration-100 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-40",
        invalid ? "border-destructive/60" : "border-border-strong focus:border-accent/60",
        className,
      )}
      {...rest}
    />
  );
});
