import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LuPin } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SectionHead } from "@/components/molecules/SectionHead";
import { ROUTES } from "@/constants/routes";
import { ProgressRing } from "@/layouts/dashboard/ProgressRing";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { computeBudgetSpent } from "@/utils/budget-breakdown";
import { cn } from "@/utils/cn";
import type { Budget } from "@/types/budget.types";
import type { TransactionCategoryBreakdown } from "@/types/transaction.types";

interface BudgetsSummaryProps {
  budgets: Budget[];
  categoryBreakdown: TransactionCategoryBreakdown[];
  isLoading: boolean;
}

/** Dashboard widget — only the budgets the user pinned (`isPinned`), full list lives at /budgets. */
export function BudgetsSummary({ budgets, categoryBreakdown, isLoading }: BudgetsSummaryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { format, formatNumber } = useMoneyFormat();

  const pinnedBudgets = budgets.filter((budget) => budget.isPinned);
  const isInitialLoading = isLoading && pinnedBudgets.length === 0;

  return (
    <Card className="flex flex-col gap-3.5">
      <SectionHead
        eyebrow={t("dashboard.budgetsEyebrow")}
        title={t("dashboard.budgetsTitle")}
        actionLabel={t("dashboard.seeAllShort")}
        onAction={() => navigate(ROUTES.BUDGETS)}
      />

      {isInitialLoading ? (
        Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex items-center gap-3.5 py-1.5">
            <Skeleton className="size-[52px] shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-3/5 rounded-full" />
            </div>
          </div>
        ))
      ) : pinnedBudgets.length === 0 ? (
        <EmptyState icon={<LuPin />} title={t("dashboard.noPinnedBudgets")} />
      ) : (
        <div
          className={cn(
            "-mx-2 flex flex-col transition-opacity duration-300",
            isLoading && "opacity-60",
          )}
        >
          {pinnedBudgets.map((budget) => {
            const spent = computeBudgetSpent(budget, categoryBreakdown);
            const ratio = budget.limitAmount > 0 ? spent / budget.limitAmount : 0;
            const percent = Math.round(ratio * 100);
            const isOverLimit = ratio > 1;
            const remaining = budget.limitAmount - spent;

            return (
              <button
                key={budget.idBudget}
                type="button"
                onClick={() =>
                  navigate(ROUTES.BUDGETS, { state: { viewingBudgetId: budget.idBudget } })
                }
                className="group flex w-full items-center gap-3.5 rounded-control px-2 py-1.5 text-left transition-colors duration-200 hover:bg-surface-2"
              >
                <ProgressRing
                  size={52}
                  thickness={6}
                  value={isOverLimit ? 1 : ratio}
                  color={isOverLimit ? "var(--expense)" : budget.color}
                  className="transition-transform duration-300 group-hover:scale-105"
                >
                  <span
                    className={cn(
                      "text-[11.5px] font-semibold tabular",
                      isOverLimit ? "text-expense-text" : "text-text",
                    )}
                  >
                    {percent}%
                  </span>
                </ProgressRing>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[14px] font-semibold text-text">
                    {budget.name}
                  </span>
                  <span className="truncate font-num text-[12.5px] text-text-2 tabular">
                    {format(spent)} / {formatNumber(budget.limitAmount)}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[12px]",
                      isOverLimit ? "text-expense-text" : "text-text-3",
                    )}
                  >
                    {isOverLimit
                      ? t("dashboard.budgetOver", { amount: format(Math.abs(remaining)) })
                      : t("dashboard.budgetRemaining", { amount: format(remaining) })}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
