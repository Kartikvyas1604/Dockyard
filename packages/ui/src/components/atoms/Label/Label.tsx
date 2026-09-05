import { forwardRef } from "react";
import { cn } from "../../../lib/cn";
import type { LabelProps } from "./Label.types";

/** Visible label — small caps, sits 4px above its input. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, hint, children, ...rest },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn(
        "flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted",
        className,
      )}
      {...rest}
    >
      <span>{children}</span>
      {hint ? <span className="font-mono normal-case tracking-normal text-foreground-faint">{hint}</span> : null}
    </label>
  );
});
