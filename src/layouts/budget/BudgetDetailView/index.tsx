import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowLeft, LuPencil, LuPin } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { Reveal } from "@/components/atoms/Reveal";
import { BudgetProgressBar } from "@/components/molecules/BudgetProgressBar";
import { Card } from "@/components/molecules/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { BudgetBreakdownList } from "@/layouts/budget/BudgetBreakdownList";
import { BudgetTile } from "@/layouts/budget/BudgetTile";
import { SetLimitModal } from "@/layouts/budget/SetLimitModal";
import { budgetScopeLabel, type BudgetPeriod } from "@/layouts/budget/budget-ui";
import { useMoneyFormat } from "@/hooks/use-money-format";
import {
  buildBudgetSlices,
  computeAllocatedLimit,
  computeBudgetProgress,
  computeBudgetSpent,
  type BudgetSlice,
} from "@/utils/budget-breakdown";
import { cn } from "@/utils/cn";
import type { Budget } from "@/types/budget.types";
import type { Category } from "@/types/category.types";
import type { TransactionCategoryBreakdown } from "@/types/transaction.types";

interface BudgetDetailViewProps {
  budget: Budget;
  categories: Category[];
  categoryBreakdown: TransactionCategoryBreakdown[];
  period: BudgetPeriod;
  isLoading: boolean;
  isPinning?: boolean;
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
  period,
  isLoading,
  isPinning,
  onClose,
  onEdit,
  onTogglePin,
  onSetChildLimit,
}: BudgetDetailViewProps) {
  const { t } = useTranslation();
  const { format, formatCompact } = useMoneyFormat();
  const [limitTarget, setLimitTarget] = useState<LimitTarget | null>(null);

  const spent = computeBudgetSpent(budget, categoryBreakdown);
  const progress = computeBudgetProgress(spent, budget.limitAmount, period);
  const isOver = progress.status === "over";
  const allocatedLimit = computeAllocatedLimit(budget);
  const pinLabel = budget.isPinned ? t("budget.unpinFromDashboard") : t("budget.pinToDashboard");

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

  const dailyPace = progress.dailyPace === null ? 0 : Math.round(progress.dailyPace);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={budget.name}
        onBack={onClose}
        hideOnDesktop
        mobileActions={
          <>
            <IconButton
              label={pinLabel}
              icon={<LuPin />}
              variant={budget.isPinned ? "soft" : "surface"}
              size="lg"
              tooltip={false}
              aria-pressed={budget.isPinned}
              disabled={isPinning}
              className={cn(
                budget.isPinned &&
                  "bg-investment-soft text-investment-text hover:bg-investment-soft hover:text-investment-text",
              )}
              onClick={onTogglePin}
            />
            <IconButton
              label={t("budget.editTitle")}
              icon={<LuPencil />}
              variant="surface"
              size="lg"
              tooltip={false}
              onClick={onEdit}
            />
          </>
        }
      />

      <button
        type="button"
        onClick={onClose}
        className="group hidden w-fit items-center gap-2 pt-2 text-[13.5px] font-semibold text-primary-text lg:flex"
      >
        <LuArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {t("budget.allBudgets")}
      </button>

      <Reveal immediate>
        <Card
          tone="hero"
          padding="none"
          className="flex flex-col gap-4 rounded-[28px] p-5 lg:gap-5 lg:p-7"
        >
          <div className="hidden items-center gap-3.5 lg:flex">
            <BudgetTile
              budget={budget}
              categories={categories}
              variant="onSurface"
              className="size-12 rounded-[16px]"
              iconClassName="size-[22px]"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h1 className="truncate font-display text-[24px] font-semibold text-hero-fg">
                {budget.name}
              </h1>
              <p className="truncate text-[13px] text-hero-fg-2">
                {budgetScopeLabel(budget, t, true)} · {period.monthLabel}
              </p>
            </div>
            <HeroButton
              icon={<LuPin />}
              label={budget.isPinned ? t("budget.pinned") : t("budget.pin")}
              title={pinLabel}
              aria-pressed={budget.isPinned}
              disabled={isPinning}
              onClick={onTogglePin}
            />
            <HeroButton icon={<LuPencil />} label={t("budget.edit")} onClick={onEdit} />
          </div>
          <p className="truncate text-[12.5px] text-hero-fg-2 lg:hidden">
            {budgetScopeLabel(budget, t)} · {period.monthLabel}
          </p>

          <div className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-2.5">
            <span
              className={cn(
                "truncate font-display text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] tabular lg:text-[44px]",
                isOver ? "text-expense-text" : "text-hero-fg",
              )}
            >
              {format(spent)}
            </span>
            <span className="truncate text-[13px] text-hero-fg-2 lg:text-[15px]">
              {t("budget.spentOfPercent", {
                limit: format(budget.limitAmount),
                percent: progress.percent,
              })}
            </span>
          </div>

          <BudgetProgressBar
            tone="hero"
            ratio={progress.ratio}
            color={isOver ? "var(--expense)" : budget.color}
            dayOfMonth={period.dayOfMonth}
            daysInMonth={period.daysInMonth}
            todayLabel={t("budget.todayLabel")}
            startLabel={period.startLabel}
            endLabel={period.endLabel}
            datesClassName="hidden lg:flex"
          />

          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            <HeroStat
              label={isOver ? t("budget.overLabel") : t("budget.remainingLabel")}
              value={format(isOver ? progress.overBy : progress.remaining)}
              compact={formatCompact(isOver ? progress.overBy : progress.remaining)}
              valueClassName={isOver ? "text-expense-text" : undefined}
            />
            <HeroStat
              label={t("budget.safePerDay")}
              shortLabel={t("budget.perDayShort")}
              value={format(dailyPace)}
              compact={formatCompact(dailyPace)}
            />
            <HeroStat
              label={t("budget.daysLeft")}
              shortLabel={t("budget.daysLeftShort")}
              value={t("budget.daysValue", { count: progress.remainingDays })}
              compact={String(progress.remainingDays)}
            />
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <BudgetBreakdownList
          slices={slices}
          isLoading={isLoading}
          onSelectSlice={handleSelectSlice}
          allocatedLimit={allocatedLimit}
          totalLimit={budget.limitAmount}
        />
      </Reveal>

      <SetLimitModal
        isOpen={limitTarget !== null}
        slice={limitTarget?.slice ?? null}
        budgetName={budget.name}
        onClose={() => setLimitTarget(null)}
        onSubmit={handleSubmitLimit}
      />
    </div>
  );
}

interface HeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
}

/** Translucent pill button on the hero gradient ("Disematkan", "Edit"). */
function HeroButton({ icon, label, className, ...rest }: HeroButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "pressable flex h-[34px] shrink-0 items-center gap-2 rounded-full bg-surface/50 px-3.5 text-[13px] font-semibold text-hero-fg transition-colors duration-200 hover:bg-surface/75 disabled:opacity-60 [&_svg]:size-[15px]",
        className,
      )}
      {...rest}
    >
      {icon}
      {label}
    </button>
  );
}

interface HeroStatProps {
  label: string;
  /** Phone label when the full one doesn't fit a third of the width. */
  shortLabel?: string;
  value: string;
  /** Phone value (compact amount / bare number). */
  compact: string;
  valueClassName?: string;
}

function HeroStat({ label, shortLabel, value, compact, valueClassName }: HeroStatProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-[14px] bg-surface px-3 py-2.5 lg:rounded-[16px] lg:px-4 lg:py-3">
      <span className="truncate text-[12px] text-text-3">
        <span className="lg:hidden">{shortLabel ?? label}</span>
        <span className="hidden lg:inline">{label}</span>
      </span>
      <span
        className={cn(
          "truncate font-num text-[15px] font-semibold text-text tabular lg:text-[17px]",
          valueClassName,
        )}
      >
        <span className="lg:hidden">{compact}</span>
        <span className="hidden lg:inline">{value}</span>
      </span>
    </div>
  );
}
