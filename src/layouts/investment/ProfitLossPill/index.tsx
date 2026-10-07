import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { formatPercent } from "@/layouts/investment/investment-ui";
import { cn } from "@/utils/cn";

interface ProfitLossPillProps {
  profitLoss: number;
  /** P/L as a percentage of capital. */
  percent: number;
  /** "↗ +1.860.000 · 6,1%" instead of just "▲ 6,1%". */
  showAmount?: boolean;
  /** White pill (on the hero gradient) instead of the soft income/expense tint. */
  onSurface?: boolean;
  className?: string;
}

/** Green / red P/L pill used on instrument cards, account cards and heroes. */
export function ProfitLossPill({
  profitLoss,
  percent,
  showAmount = false,
  onSurface = false,
  className,
}: ProfitLossPillProps) {
  const { language } = useLanguage();
  const { formatNumber } = useMoneyFormat();
  const isLoss = profitLoss < 0;
  const sign = isLoss ? "−" : "+";
  const TrendIcon = isLoss ? LuTrendingDown : LuTrendingUp;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-[9px] py-[3px] font-num text-[12px] leading-[15px] font-semibold whitespace-nowrap tabular",
        onSurface ? "bg-surface" : isLoss ? "bg-expense-soft" : "bg-income-soft",
        isLoss ? "text-expense-text" : "text-income-text",
        className,
      )}
    >
      {showAmount ? (
        <>
          <TrendIcon className="size-3 shrink-0" />
          {sign}
          {formatNumber(Math.abs(profitLoss))} · {formatPercent(percent, language)}
        </>
      ) : (
        <>
          <span aria-hidden="true" className="text-[10px]">
            {isLoss ? "▼" : "▲"}
          </span>
          {formatPercent(percent, language)}
        </>
      )}
    </span>
  );
}
