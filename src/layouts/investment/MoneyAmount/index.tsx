import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";

interface MoneyAmountProps {
  value: number;
  /** Prefix for the number ("+", "−"). Absolute value is formatted when set. */
  sign?: string;
  className?: string;
  symbolClassName?: string;
  numberClassName?: string;
}

/** "IDR 86.150.000" with a small muted currency symbol and a big tabular number. */
export function MoneyAmount({
  value,
  sign,
  className,
  symbolClassName,
  numberClassName,
}: MoneyAmountProps) {
  const { symbol, formatNumber } = useMoneyFormat();

  return (
    <span className={cn("inline-flex min-w-0 items-baseline gap-1.5", className)}>
      <span className={cn("shrink-0 font-display", symbolClassName)}>{symbol}</span>
      <span className={cn("truncate font-num font-semibold tabular", numberClassName)}>
        {sign}
        {formatNumber(sign !== undefined ? Math.abs(value) : value)}
      </span>
    </span>
  );
}
