import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface NativeButtonProps {
  onPress?: () => void;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
