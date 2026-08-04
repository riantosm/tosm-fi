import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { computeBudgetSpent } from "@/utils/budget-breakdown";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
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
  const { format } = useCurrency();

  const pinnedBudgets = budgets.filter((budget) => budget.isPinned);

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
          {t("dashboard.budgetsTitle")}
        </Words>
        <button
          type="button"
          onClick={() => navigate(ROUTES.BUDGETS)}
          className="text-[13px] font-bold text-primary-600 hover:underline dark:text-primary-400"
        >
          {t("dashboard.viewAll")}
        </button>
      </div>

      {pinnedBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-8 dark:border-ink-800">
          <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
            {t("dashboard.noPinnedBudgets")}
          </Words>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {pinnedBudgets.map((budget) => {
            const spent = computeBudgetSpent(budget, categoryBreakdown);
            const percentage = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
            const isOverLimit = percentage > 100;

            return (
              <button
                key={budget.idBudget}
                type="button"
                onClick={() =>
                  navigate(ROUTES.BUDGETS, { state: { viewingBudgetId: budget.idBudget } })
                }
                className="flex flex-col gap-1.5 rounded-xl p-2 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <Words type="sm/bold" as="span" className="truncate text-ink-900 dark:text-ink-50">
                    {budget.name}
                  </Words>
                  <Words
                    type="xs/bold"
                    as="span"
                    className={cn(
                      "shrink-0 whitespace-nowrap text-ink-400 dark:text-ink-500",
                      isOverLimit && "text-red-500 dark:text-red-400",
                    )}
                  >
                    {format(spent)} / {format(budget.limitAmount)}
                  </Words>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: isOverLimit ? "#EF4444" : budget.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px] dark:bg-ink-950/60">
          <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      )}
    </div>
  );
}
