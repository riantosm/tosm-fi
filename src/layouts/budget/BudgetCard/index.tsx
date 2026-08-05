import { useTranslation } from "react-i18next";
import { HiOutlinePencilSquare, HiOutlineStar, HiStar } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { BudgetProgressBar } from "@/components/molecules/BudgetProgressBar";
import { useCurrency } from "@/hooks/use-currency";
import { computeBudgetSpent, getCurrentMonthRange } from "@/utils/budget-breakdown";
import type { Budget } from "@/types/budget.types";
import type { TransactionCategoryBreakdown } from "@/types/transaction.types";

interface BudgetCardProps {
  budget: Budget;
  categoryBreakdown: TransactionCategoryBreakdown[];
  onOpen: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
}

export function BudgetCard({
  budget,
  categoryBreakdown,
  onOpen,
  onEdit,
  onTogglePin,
}: BudgetCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  const spent = computeBudgetSpent(budget, categoryBreakdown);
  const { dateFrom, dateTo, daysInMonth, dayOfMonth } = getCurrentMonthRange();
  const percentage = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
  const remainingDays = Math.max(0, daysInMonth - dayOfMonth);
  const remainingAmount = Math.max(0, budget.limitAmount - spent);
  const dailyPacing = remainingDays > 0 ? remainingAmount / remainingDays : null;

  const startLabel = new Date(dateFrom).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = new Date(dateTo).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="relative flex h-full flex-col gap-4 rounded-2xl p-5 text-left transition-transform hover:scale-[1.01]"
      style={{ backgroundColor: budget.color }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={budget.name}
        className="absolute inset-0 rounded-2xl"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Words type="lg/bold" as="h3" className="text-white">
            {budget.name}
          </Words>
          <div className="flex flex-col items-baseline gap-1.5">
            <Words type="xl/bold" as="span" className="text-white">
              {format(spent)}
            </Words>
            <Words type="xs/regular" as="span" className="text-white/70">
              {t("budget.spentOf", { limit: format(budget.limitAmount) })}
            </Words>
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <Tooltip
            content={budget.isPinned ? t("budget.unpinFromDashboard") : t("budget.pinToDashboard")}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTogglePin();
              }}
              aria-label={
                budget.isPinned ? t("budget.unpinFromDashboard") : t("budget.pinToDashboard")
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              {budget.isPinned ? (
                <HiStar className="h-4 w-4" />
              ) : (
                <HiOutlineStar className="h-4 w-4" />
              )}
            </button>
          </Tooltip>

          <Tooltip content={t("budget.editTitle")}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              aria-label={t("budget.editTitle")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <HiOutlinePencilSquare className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      <BudgetProgressBar
        dayOfMonth={dayOfMonth}
        daysInMonth={daysInMonth}
        percentage={percentage}
        todayLabel={t("budget.todayLabel")}
        startLabel={startLabel}
        endLabel={endLabel}
      />

      <Words type="xxs/regular" as="span" className="text-white/70">
        {dailyPacing !== null
          ? t("budget.dailyPacingHint", { amount: format(dailyPacing), days: remainingDays })
          : t("budget.lastDayHint")}
      </Words>
    </div>
  );
}
