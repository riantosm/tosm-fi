import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "@/components/atoms/Tooltip";
import { cn } from "@/utils/cn";

export type IconButtonVariant = "surface" | "soft" | "ghost" | "primary" | "outline" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible name — also shown as the tooltip unless `tooltip={false}`. */
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  tooltip?: boolean;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  surface: "bg-surface text-text-2 shadow-card hover:text-text hover:bg-surface-2",
  soft: "bg-surface-2 text-text-2 hover:bg-surface-3 hover:text-text",
  ghost: "bg-transparent text-text-3 hover:bg-surface-2 hover:text-text",
  outline: "border border-border bg-surface text-text-2 hover:bg-surface-2 hover:text-text",
  primary:
    "bg-primary text-primary-fg shadow-[0_6px_16px_color-mix(in_oklab,var(--primary)_32%,transparent)] hover:brightness-[1.06]",
  danger: "bg-expense-soft text-expense-text hover:brightness-[0.97]",
};

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: "size-9 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-[18px]",
  lg: "size-11 [&_svg]:size-[19px]",
};

export function IconButton({
  label,
  icon,
  variant = "soft",
  size = "md",
  tooltip = true,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "pressable inline-flex shrink-0 items-center justify-center rounded-full",
        "disabled:cursor-not-allowed disabled:opacity-50",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );

  return tooltip ? <Tooltip content={label}>{button}</Tooltip> : button;
}
