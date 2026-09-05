import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. primary = the one accent action on screen. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows an in-flight state and disables the control. */
  loading?: boolean;
  /** Leading element (icon). Rendered muted; decoration only. */
  leading?: ReactNode;
  children?: ReactNode;
}
