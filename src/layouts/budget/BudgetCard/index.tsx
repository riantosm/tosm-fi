import { useTranslation } from "react-i18next";
import { LuGauge, LuPencil, LuPin, LuTriangleAlert } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { BudgetProgressBar } from "@/components/molecules/BudgetProgressBar";
import { Card } from "@/components/molecules/Card";
import { BudgetPercentBadge } from "@/layouts/budget/BudgetPercentBadge";
import { BudgetTile } from "@/layouts/budget/BudgetTile";
import { budgetScopeLabel, type BudgetPeriod } from "@/layouts/budget/budget-ui";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { computeBudgetProgress, computeBudgetSpent } from "@/utils/budget-breakdown";
import { cn } from "@/utils/cn";
import type { Budget } from "@/types/budget.types";
import type { Category } from "@/types/category.types";
import type { TransactionCategoryBreakdown } from "@/types/transaction.types";

interface BudgetCardProps {
  budget: Budget;
  categories: Category[];
  categoryBreakdown: TransactionCategoryBreakdown[];
  period: BudgetPeriod;
  isPinning?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
}

/**
 * One budget in the grid. Desktop: amount + dated bar + pin/edit buttons.
 * Phone: compact "spent / limit" card; pin and edit live in the detail view.
 */
export function BudgetCard({
  budget,
  categories,
  categoryBreakdown,
  period,
  isPinning,
  onOpen,
  onEdit,
  onTogglePin,
}: BudgetCardProps) {
  const { t } = useTranslation();
  const { format, formatNumber } = useMoneyFormat();

  const spent = computeBudgetSpent(budget, categoryBreakdown);
  const progress = computeBudgetProgress(spent, budget.limitAmount, period);
  const isOver = progress.status === "over";
  const pinLabel = budget.isPinned ? t("budget.unpinFromDashboard") : t("budget.pinToDashboard");

  return (
    <Card
      interactive
      className={cn(
        "relative flex h-full flex-col gap-3 p-4 lg:gap-4 lg:p-6",
        isOver && "ring-[1.5px] ring-expense",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={budget.name}
        className="absolute inset-0 rounded-card"
      />

      <div className="flex items-center gap-3">
        <BudgetTile budget={budget} categories={categories} className="size-10 lg:size-[42px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[15px] font-semibold text-text">{budget.name}</span>
          <span className="hidden truncate text-[12px] text-text-3 lg:block">
            {budgetScopeLabel(budget, t)}
          </span>
          <span
            className={cn(
              "truncate font-num text-[13px] tabular lg:hidden",
              isOver ? "text-expense-text" : "text-text-2",
            )}
          >
            {format(spent)} / {formatNumber(budget.limitAmount)}
          </span>
        </div>

        {/* Phone: pinned marker + percentage */}
        <div className="flex shrink-0 items-center gap-2.5 lg:hidden">
          {budget.isPinned && (
            <LuPin className="size-4 text-investment-text" aria-label={t("budget.pinnedBadge")} />
          )}
          <BudgetPercentBadge percent={progress.percent} status={progress.status} />
        </div>

        {/* Desktop: pin + edit */}
        <div className="relative z-10 hidden shrink-0 items-center gap-2 lg:flex">
          <IconButton
            label={pinLabel}
            icon={<LuPin />}
            size="sm"
            className={cn(
              "size-[34px] [&_svg]:size-[15px]",
              budget.isPinned &&
                "bg-investment-soft text-investment-text hover:bg-investment-soft hover:text-investment-text",
            )}
            aria-pressed={budget.isPinned}
            disabled={isPinning}
            onClick={onTogglePin}
          />
          <IconButton
            label={t("budget.editTitle")}
            icon={<LuPencil />}
            size="sm"
            className="size-[34px] [&_svg]:size-[15px]"
            onClick={onEdit}
          />
        </div>
      </div>

      <div className="hidden items-end justify-between gap-3 lg:flex">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className={cn(
              "truncate font-num text-[24px] leading-[30px] font-semibold tracking-[-0.02em] tabular",
              isOver ? "text-expense-text" : "text-text",
            )}
          >
            {format(spent)}
          </span>
          <span className="truncate text-[12.5px] text-text-3">
            {t("budget.spentOf", { limit: format(budget.limitAmount) })}
          </span>
        </div>
        <BudgetPercentBadge percent={progress.percent} status={progress.status} />
      </div>

      <BudgetProgressBar
        ratio={progress.ratio}
        color={isOver ? "var(--expense)" : budget.color}
        dayOfMonth={period.dayOfMonth}
        daysInMonth={period.daysInMonth}
        todayLabel={t("budget.todayLabel")}
        startLabel={period.startLabel}
        endLabel={period.endLabel}
        datesClassName="hidden lg:flex"
      />

      <p
        className={cn(
          "flex items-center gap-2 text-[12.5px]",
          isOver ? "text-expense-text" : "text-text-2",
        )}
      >
        {isOver ? (
          <LuTriangleAlert className="hidden size-[15px] shrink-0 lg:block" />
        ) : (
          <LuGauge className="hidden size-[15px] shrink-0 text-text-3 lg:block" />
        )}
        <span className="truncate">
          {isOver
            ? t("budget.overBy", { amount: formatNumber(progress.overBy) })
            : progress.dailyPace === null
              ? t("budget.paceLastDay", { remaining: formatNumber(progress.remaining) })
              : t("budget.paceHint", {
                  remaining: formatNumber(progress.remaining),
                  daily: formatNumber(Math.round(progress.dailyPace)),
                })}
        </span>
      </p>
    </Card>
  );
}
