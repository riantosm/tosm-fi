import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";

export type TxAmountTone = "income" | "expense" | "neutral" | "muted";

interface TxRowBaseProps {
  /** Icon element shown inside the round tile. */
  icon: ReactNode;
  /** Hex tile/icon color (category / wallet color). Omit for token tones. */
  color?: string;
  /** Token tone for the tile when there is no hex color. */
  tone?: "neutral" | "income" | "expense" | "investment" | "primary";
  title: ReactNode;
  meta?: ReactNode;
  amount?: ReactNode;
  amountTone?: TxAmountTone;
  /** Small text under the amount (time). */
  caption?: ReactNode;
  /** Replaces the default amount column (e.g. action buttons). */
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
  /** Extra line under the meta (notes, change chips…). */
  children?: ReactNode;
}

const TONE_TILE: Record<NonNullable<TxRowBaseProps["tone"]>, string> = {
  neutral: "bg-surface-2 text-text-3",
  income: "bg-income-soft text-income-text",
  expense: "bg-expense-soft text-expense-text",
  investment: "bg-investment-soft text-investment-text",
  primary: "bg-primary-soft text-primary-text",
};

const AMOUNT_CLASS: Record<TxAmountTone, string> = {
  income: "text-income-text",
  expense: "text-expense-text",
  neutral: "text-text",
  muted: "text-text-2",
};

/**
 * The one transaction-row look (V2/TxRow): round tile, title + meta, amount +
 * time. Shared by the Dashboard/Transaksi lists, investment ledger rows and
 * the Catat Cepat preview so they read identically.
 */
export function TxRowBase({
  icon,
  color,
  tone = "neutral",
  title,
  meta,
  amount,
  amountTone = "neutral",
  caption,
  trailing,
  onClick,
  className,
  children,
}: TxRowBaseProps) {
  const Comp = onClick ? "button" : "div";
  const tileStyle: CSSProperties | undefined = color
    ? { backgroundColor: `${color}26`, color }
    : undefined;

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3.5 rounded-control px-2 py-2.5 text-left",
        onClick && "transition-colors duration-200 hover:bg-surface-2 active:scale-[0.995]",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-[42px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 [&_svg]:size-[18px]",
          onClick && "group-hover:scale-105",
          !color && TONE_TILE[tone],
        )}
        style={tileStyle}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[14px] font-semibold text-text">{title}</span>
        {meta && <span className="truncate text-[12.5px] text-text-3">{meta}</span>}
        {children}
      </span>
      {trailing ?? (
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          {amount !== undefined && (
            <span
              className={cn(
                "font-num text-[14px] font-semibold whitespace-nowrap tabular",
                AMOUNT_CLASS[amountTone],
              )}
            >
              {amount}
            </span>
          )}
          {caption && <span className="text-[12px] text-text-3 tabular">{caption}</span>}
        </span>
      )}
    </Comp>
  );
}
