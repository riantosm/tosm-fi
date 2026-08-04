import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePencilSquare, HiOutlineStar, HiStar, HiXMark } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { BudgetProgressBar } from "@/components/molecules/BudgetProgressBar";
import { BudgetBreakdownList } from "@/layouts/budget/BudgetBreakdownList";
import { SetLimitModal } from "@/layouts/budget/SetLimitModal";
import { useCurrency } from "@/hooks/use-currency";
import {
  buildBudgetSlices,
  computeAllocatedLimit,
  computeBudgetSpent,
  getCurrentMonthRange,
  type BudgetSlice,
} from "@/utils/budget-breakdown";
import type { Budget } from "@/types/budget.types";
import type { Category } from "@/types/category.types";
import type { TransactionCategoryBreakdown } from "@/types/transaction.types";

interface BudgetDetailViewProps {
  budget: Budget;
  categories: Category[];
  categoryBreakdown: TransactionCategoryBreakdown[];
  isLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onSetChildLimit: (idCategory: string, idSubCategory: string | null, limitAmount: number) => void;
}

interface LimitTarget {
  idCategory: string;
  idSubCategory: string | null;
  slice: BudgetSlice;
}

export function BudgetDetailView({
  budget,
  categories,
  categoryBreakdown,
  isLoading,
  onClose,
  onEdit,
  onTogglePin,
  onSetChildLimit,
}: BudgetDetailViewProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [limitTarget, setLimitTarget] = useState<LimitTarget | null>(null);

  const spent = computeBudgetSpent(budget, categoryBreakdown);
  const allocatedLimit = computeAllocatedLimit(budget);
  const { dateFrom, dateTo, daysInMonth, dayOfMonth } = getCurrentMonthRange();
  const percentage = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
  const remainingDays = Math.max(0, daysInMonth - dayOfMonth);
  const remainingAmount = Math.max(0, budget.limitAmount - spent);
  const dailyPacing = remainingDays > 0 ? remainingAmount / remainingDays : null;

  const startLabel = new Date(dateFrom).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = new Date(dateTo).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const slices = useMemo(
    () => buildBudgetSlices(budget, categories, categoryBreakdown),
    [budget, categories, categoryBreakdown],
  );

  function handleSelectSlice(slice: BudgetSlice, parentSlice?: BudgetSlice) {
    if (parentSlice) {
      setLimitTarget({ idCategory: parentSlice.id, idSubCategory: slice.id, slice });
      return;
    }
    setLimitTarget({ idCategory: slice.id, idSubCategory: null, slice });
  }

  function handleSubmitLimit(limitAmount: number) {
    if (!limitTarget) return;
    onSetChildLimit(limitTarget.idCategory, limitTarget.idSubCategory, limitAmount);
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-col gap-4 rounded-2xl p-6"
        style={{ backgroundColor: budget.color }}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <HiXMark className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1">
            <Tooltip
              content={budget.isPinned ? t("budget.unpinFromDashboard") : t("budget.pinToDashboard")}
            >
              <button
                type="button"
                onClick={onTogglePin}
                aria-label={budget.isPinned ? t("budget.unpinFromDashboard") : t("budget.pinToDashboard")}
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
                onClick={onEdit}
                aria-label={t("budget.editTitle")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <HiOutlinePencilSquare className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <Words type="lg/bold" as="h2" className="text-white">
            {budget.name}
          </Words>
          <div className="flex items-baseline gap-1.5">
            <Words type="2xl/bold" as="span" className="text-white">
              {format(spent)}
            </Words>
            <Words type="xs/regular" as="span" className="text-white/70">
              {t("budget.spentOf", { limit: format(budget.limitAmount) })}
            </Words>
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

        <Words type="xxs/regular" as="span" className="text-center text-white/70">
          {dailyPacing !== null
            ? t("budget.dailyPacingHint", { amount: format(dailyPacing), days: remainingDays })
            : t("budget.lastDayHint")}
        </Words>
      </div>

      <BudgetBreakdownList
        slices={slices}
        title={t("budget.breakdownTitle")}
        periodLabel={t("dashboard.thisMonth")}
        isLoading={isLoading}
        onSelectSlice={handleSelectSlice}
        allocatedLimit={allocatedLimit}
        totalLimit={budget.limitAmount}
      />

      <SetLimitModal
        isOpen={limitTarget !== null}
        slice={limitTarget?.slice ?? null}
        onClose={() => setLimitTarget(null)}
        onSubmit={handleSubmitLimit}
      />
    </div>
  );
}
