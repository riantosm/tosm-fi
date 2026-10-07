import type { ReactNode } from "react";
import { LuCalculator } from "react-icons/lu";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";

interface AmountCardProps {
  amount: number;
  /** Opens the calculator. Omit for a read-only amount. */
  onPickAmount?: () => void;
  pickAmountLabel?: string;
  /** Row above the amount (e.g. CategoryPickerRow), separated by a divider. */
  header?: ReactNode;
  /** Small caption above the number ("Saldo sebenarnya"). */
  caption?: ReactNode;
  /** Content under the number (difference chip…). */
  footer?: ReactNode;
  align?: "start" | "end";
  className?: string;
}

/** The big "IDR 45.000" block of every money dialog (design AmountCard). */
export function AmountCard({
  amount,
  onPickAmount,
  pickAmountLabel,
  header,
  caption,
  footer,
  align = "start",
  className,
}: AmountCardProps) {
  const { symbol, formatNumber } = useMoneyFormat();
  const value = formatNumber(amount);
  const sizeClass =
    value.length > 14 ? "text-[28px]" : value.length > 11 ? "text-[34px]" : "text-[40px]";

  const number = (
    <span className={cn("flex min-w-0 items-baseline gap-2", align === "end" && "justify-end")}>
      <span className="shrink-0 font-display text-[18px] font-medium text-text-3">{symbol}</span>
      <span
        key={value}
        className={cn(
          "animate-fade-in truncate font-num leading-[1.1] font-semibold tracking-[-0.02em] text-text tabular",
          sizeClass,
        )}
      >
        {value}
      </span>
    </span>
  );

  return (
    <div className={cn("flex flex-col gap-3.5 rounded-[20px] bg-surface-2 p-[18px]", className)}>
      {header && (
        <>
          {header}
          <span className="h-px bg-border" aria-hidden="true" />
        </>
      )}
      <div className={cn("flex flex-col gap-1", align === "end" && "items-end text-right")}>
        {caption && <span className="text-[12.5px] text-text-3">{caption}</span>}
        {onPickAmount ? (
          <button
            type="button"
            onClick={onPickAmount}
            aria-label={pickAmountLabel}
            className="group flex w-full min-w-0 items-center justify-between gap-3 text-left"
          >
            {number}
            <span className="pressable flex size-[42px] shrink-0 items-center justify-center rounded-full bg-surface text-primary-text shadow-card group-hover:bg-primary-soft">
              <LuCalculator className="size-[18px]" />
            </span>
          </button>
        ) : (
          number
        )}
        {footer}
      </div>
    </div>
  );
}
