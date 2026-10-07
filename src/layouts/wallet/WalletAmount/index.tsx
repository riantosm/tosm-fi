import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";

interface WalletAmountProps {
  value: number;
  className?: string;
  /** Classes for the currency symbol ("IDR"). */
  currencyClassName?: string;
  /** Classes for the number ("24.500.000"). */
  numberClassName?: string;
}

/** Balance in the Mist style: small muted currency + large Outfit number. */
export function WalletAmount({
  value,
  className,
  currencyClassName,
  numberClassName,
}: WalletAmountProps) {
  const { symbol, formatNumber } = useMoneyFormat();
  const number = formatNumber(value);

  return (
    <span className={cn("flex min-w-0 items-baseline", className)}>
      <span className={cn("shrink-0 font-display font-medium", currencyClassName)}>{symbol}</span>
      <span
        key={number}
        className={cn(
          "min-w-0 animate-fade-in truncate font-num leading-none font-semibold tabular",
          numberClassName,
        )}
      >
        {number}
      </span>
    </span>
  );
}
