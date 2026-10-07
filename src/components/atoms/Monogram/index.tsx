import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/initials";

type MonogramSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<MonogramSize, string> = {
  xs: "size-6 text-[9.5px]",
  sm: "size-8 text-[11px]",
  md: "size-[38px] text-[13px]",
  lg: "size-[46px] text-[15px]",
  xl: "size-[52px] text-[16px]",
};

/** Corner radius per size for `shape="square"` (instrument / account tiles). */
const SQUARE_CLASS: Record<MonogramSize, string> = {
  xs: "rounded-[7px]",
  sm: "rounded-[9px]",
  md: "rounded-[12px]",
  lg: "rounded-[14px]",
  xl: "rounded-[16px]",
};

interface MonogramProps {
  /** Name the two-letter monogram is derived from (instrument / account). */
  name: string;
  /** User hex color. soft = `${color}26` tile with colored letters; solid = filled tile with white letters. */
  color: string;
  variant?: "soft" | "solid";
  /** circle (asset allocation, pickers) or rounded square (Investasi instrument + account tiles). */
  shape?: "circle" | "square";
  size?: MonogramSize;
  className?: string;
  /** Overlay content (e.g. a selection check badge). */
  children?: ReactNode;
}

/** Two-letter tile for instruments and investment accounts. */
export function Monogram({
  name,
  color,
  variant = "soft",
  shape = "circle",
  size = "md",
  className,
  children,
}: MonogramProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center font-display font-semibold tracking-[0.02em]",
        SIZE_CLASS[size],
        shape === "square" ? SQUARE_CLASS[size] : "rounded-full",
        className,
      )}
      style={
        variant === "solid"
          ? { backgroundColor: color, color: "#fff" }
          : { backgroundColor: `${color}26`, color }
      }
    >
      {getInitials(name)}
      {children}
    </span>
  );
}
