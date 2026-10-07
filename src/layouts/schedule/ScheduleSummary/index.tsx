import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowDownLeft, LuArrowUpRight, LuCalendarClock } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";

export interface NextDueInfo {
  title: string;
  /** "hari ini", "Sel, 20 Okt". */
  whenLabel: string;
  /** "Senin, 5 Okt". */
  dateLabel: string;
  amount: number;
  isIncome: boolean;
}

interface ScheduleSummaryProps {
  nextDue: NextDueInfo | null;
  monthlyExpense: number;
  monthlyExpenseCount: number;
  monthlyIncome: number;
  monthlyIncomeCount: number;
  isLoading?: boolean;
}

function StatCard({
  icon,
  iconClassName,
  label,
  shortLabel,
  value,
  compact,
  valueClassName,
  meta,
  isLoading,
}: {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  shortLabel: string;
  value: string;
  compact: string;
  valueClassName: string;
  meta: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3.5 rounded-control bg-surface px-3.5 py-3 shadow-card lg:rounded-card lg:px-6 lg:py-6">
      <span
        className={cn(
          "hidden size-11 shrink-0 items-center justify-center rounded-full lg:flex [&_svg]:size-[18px]",
          iconClassName,
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12px] text-text-3 lg:text-[13px]">
          <span className="lg:hidden">{shortLabel}</span>
          <span className="hidden lg:inline">{label}</span>
        </span>
        {isLoading ? (
          <Skeleton className="h-6 w-28 rounded-full" />
        ) : (
          <span
            className={cn(
              "truncate font-num text-[17px] font-semibold tabular lg:text-[21px]",
              valueClassName,
            )}
          >
            <span className="lg:hidden">{compact}</span>
            <span className="hidden lg:inline">{value}</span>
          </span>
        )}
        <span className="hidden truncate text-[12.5px] text-text-3 lg:block">{meta}</span>
      </span>
    </div>
  );
}

/** "Jatuh tempo berikutnya" hero + monthly recurring expense / income. */
export function ScheduleSummary({
  nextDue,
  monthlyExpense,
  monthlyExpenseCount,
  monthlyIncome,
  monthlyIncomeCount,
  isLoading,
}: ScheduleSummaryProps) {
  const { t } = useTranslation();
  const { format, formatNumber, formatCompact } = useMoneyFormat();

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-4">
      <div className="col-span-2 flex min-w-0 items-center gap-3.5 rounded-[20px] bg-gradient-to-br from-hero-bg to-hero-bg-2 px-4 py-3.5 text-hero-fg lg:col-span-1 lg:rounded-card lg:px-5 lg:py-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-investment-text shadow-card">
          <LuCalendarClock className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[12.5px] text-hero-fg-2 lg:text-[13px]">
            {t("schedule.nextDue")}
          </span>
          {isLoading ? (
            <Skeleton className="h-5 w-40 rounded-full" />
          ) : (
            <span className="truncate font-display text-[15.5px] font-semibold text-hero-fg lg:text-[20px]">
              {nextDue
                ? t("schedule.nextDueTitle", { title: nextDue.title, when: nextDue.whenLabel })
                : t("schedule.noNextDue")}
            </span>
          )}
          {nextDue && (
            <span className="hidden truncate text-[12.5px] text-hero-fg-2 lg:block">
              <span className="first-letter:uppercase">{nextDue.dateLabel}</span> ·{" "}
              {format(nextDue.amount)}
            </span>
          )}
        </span>
        {nextDue && (
          <span className="shrink-0 font-num text-[15px] font-semibold text-hero-fg tabular lg:hidden">
            {nextDue.isIncome ? "+" : "−"}
            {formatNumber(nextDue.amount)}
          </span>
        )}
      </div>

      <StatCard
        icon={<LuArrowUpRight />}
        iconClassName="bg-expense-soft text-expense-text"
        label={t("schedule.monthlyExpense")}
        shortLabel={t("schedule.monthlyExpenseShort")}
        value={format(monthlyExpense)}
        compact={formatCompact(monthlyExpense)}
        valueClassName="text-expense-text"
        meta={t("schedule.monthlyExpenseMeta", { count: monthlyExpenseCount })}
        isLoading={isLoading}
      />
      <StatCard
        icon={<LuArrowDownLeft />}
        iconClassName="bg-income-soft text-income-text"
        label={t("schedule.monthlyIncome")}
        shortLabel={t("schedule.monthlyIncomeShort")}
        value={format(monthlyIncome)}
        compact={formatCompact(monthlyIncome)}
        valueClassName="text-income-text"
        meta={t("schedule.monthlyIncomeMeta", { count: monthlyIncomeCount })}
        isLoading={isLoading}
      />
    </div>
  );
}
