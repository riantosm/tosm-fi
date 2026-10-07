import type { BudgetStatus } from "@/utils/budget-breakdown";
import { cn } from "@/utils/cn";

const TONE_CLASS: Record<BudgetStatus, string> = {
  ok: "bg-surface-2 text-text-2",
  warn: "bg-investment-soft text-investment-text",
  over: "bg-expense-soft text-expense-text",
};

interface BudgetPercentBadgeProps {
  percent: number;
  status: BudgetStatus;
  className?: string;
}

/** "77%" pill — neutral, amber from 90%, red past the limit. */
export function BudgetPercentBadge({ percent, status, className }: BudgetPercentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-num text-[13px] leading-4 font-semibold tabular transition-colors duration-300",
        TONE_CLASS[status],
        className,
      )}
    >
      {percent}%
    </span>
  );
}
