import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { IconLoader } from "@/components/atoms/IconLoader";

export type ButtonVariant =
  "primary" | "soft" | "secondary" | "outline" | "ghost" | "danger" | "danger-soft";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Icon element rendered before the label (e.g. `<LuPlus />`). */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg shadow-[0_6px_18px_color-mix(in_oklab,var(--primary)_32%,transparent)] hover:brightness-[1.06] hover:shadow-[0_10px_24px_color-mix(in_oklab,var(--primary)_38%,transparent)]",
  soft: "bg-primary-soft text-primary-text hover:bg-[color-mix(in_oklab,var(--primary-soft),var(--primary)_14%)]",
  secondary:
    "bg-primary-soft text-primary-text hover:bg-[color-mix(in_oklab,var(--primary-soft),var(--primary)_14%)]",
  outline:
    "border border-border bg-surface text-text hover:border-border-strong hover:bg-surface-2",
  ghost: "bg-transparent text-text-2 hover:bg-surface-2 hover:text-text",
  danger:
    "bg-expense-text text-surface shadow-[0_6px_18px_color-mix(in_oklab,var(--expense-text)_28%,transparent)] hover:brightness-110",
  "danger-soft": "bg-expense-soft text-expense-text hover:brightness-[0.97]",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 gap-1.5 text-[13px] [&_svg]:size-4",
  md: "h-11 px-5 gap-2 text-[14px] [&_svg]:size-[18px]",
  lg: "h-[50px] px-6 gap-2 text-[14.5px] [&_svg]:size-[18px]",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "pressable inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-semibold",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {isLoading ? <IconLoader className="animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
