import { IconArrowDownRight, IconArrowUpRight } from "@/components/atoms/Icons";
import type { SummaryStat } from "@/types/dashboard.types";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/utils/cn";

interface StatCardProps {
  stat: SummaryStat;
}

export function StatCard({ stat }: StatCardProps) {
  const isUp = stat.trend === "up";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <span className="text-sm text-ink-500 dark:text-ink-400">{stat.label}</span>
      <span className="text-2xl font-semibold text-ink-900 dark:text-ink-50">
        {formatCurrency(stat.value)}
      </span>
      <div
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          isUp
            ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
            : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
        )}
      >
        {isUp ? (
          <IconArrowUpRight className="h-3.5 w-3.5" />
        ) : (
          <IconArrowDownRight className="h-3.5 w-3.5" />
        )}
        {stat.changePercent}%
      </div>
    </div>
  );
}
