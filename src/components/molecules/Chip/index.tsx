import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LuX } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Color dot before the label (wallet / instrument color). */
  dot?: string;
  icon?: ReactNode;
  /** `page` = chip sits directly on the page background; `card` = inside a card. */
  surface?: "page" | "card";
  /** soft = filled inactive chip (filters, quick picks); outline = white chip with a stroke (wallet pickers). */
  variant?: "soft" | "outline";
  size?: "sm" | "md";
  /** Shows a small × after the label (removable selection chips). */
  removable?: boolean;
  children: ReactNode;
}

/**
 * Filter chip. Active = primary-soft fill + primary stroke (pattern from
 * 04 Transaksi). For period/tab selection use SegmentedControl instead.
 */
export function Chip({
  active = false,
  dot,
  icon,
  surface = "card",
  variant = "soft",
  size = "md",
  removable = false,
  className,
  children,
  type = "button",
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "pressable inline-flex max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border [&_svg]:size-3.5",
        size === "md" ? "h-9 px-3.5 text-[13px]" : "h-8 px-3 text-[12.5px]",
        active
          ? "border-primary bg-primary-soft font-semibold text-primary-text"
          : variant === "outline"
            ? "border-border bg-surface font-medium text-text-2 hover:border-border-strong hover:text-text"
            : cn(
                "border-transparent font-medium text-text-2 hover:text-text",
                surface === "page"
                  ? "bg-surface hover:bg-surface-2"
                  : "bg-surface-2 hover:bg-surface-3",
              ),
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      {dot && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: dot }} />}
      {icon}
      <span className="truncate">{children}</span>
      {removable && <LuX className="!size-3 shrink-0 opacity-70" />}
    </button>
  );
}
