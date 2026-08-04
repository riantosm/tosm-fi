import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineChevronDown, HiOutlineTag } from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { DonutChart, type DonutChartDatum } from "@/components/molecules/DonutChart";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/utils/cn";
import type { BudgetSlice } from "@/utils/budget-breakdown";

interface BudgetBreakdownListProps {
  /** Already-aggregated rows from `buildBudgetSlices` — this component never reduces raw data itself. */
  slices: BudgetSlice[];
  title: string;
  periodLabel: string;
  isLoading?: boolean;
  /** `parentSlice` is present only when the clicked row is a subcategory nested under an expanded category row. */
  onSelectSlice: (slice: BudgetSlice, parentSlice?: BudgetSlice) => void;
  /** Sum of every category-level limit set under the budget — omitted (or 0) hides the hint. */
  allocatedLimit?: number;
  /** The budget's own overall limit, paired with `allocatedLimit` in the hint. */
  totalLimit?: number;
}

interface BudgetSliceRowProps {
  slice: BudgetSlice;
  formatAmount: (value: number) => string;
  /** Always available — opens the limit editor for this exact row (category or subcategory), independent of expand/collapse. */
  onSelect: () => void;
  /** Present only when this row has subcategories to drill into; renders as its own chevron button, separate from `onSelect`. */
  onToggle?: () => void;
  isExpanded?: boolean;
  onHoverChange?: (isHovering: boolean) => void;
  isSubCategory?: boolean;
}

function BudgetSliceRow({
  slice,
  formatAmount,
  onSelect,
  onToggle,
  isExpanded,
  onHoverChange,
  isSubCategory,
}: BudgetSliceRowProps) {
  const { t } = useTranslation();
  const Icon = slice.icon ? resolveCategoryIcon(slice.icon) : HiOutlineTag;
  const name = slice.name ?? t("dashboard.otherSubCategory");
  const hasLimit = slice.limit !== null && slice.limit > 0;
  const percentage = hasLimit ? (slice.spent / (slice.limit as number)) * 100 : 0;
  const isOverLimit = hasLimit && percentage > 100;

  return (
    <div
      onMouseEnter={onHoverChange ? () => onHoverChange(true) : undefined}
      onMouseLeave={onHoverChange ? () => onHoverChange(false) : undefined}
      className={cn("flex w-full flex-col gap-1 rounded-xl py-0.5", isSubCategory && "px-6")}
    >
      <div className="flex w-full items-center gap-1">
        <button
          type="button"
          onClick={onSelect}
          className="flex flex-1 items-center gap-2.5 rounded-xl px-1 py-0.5 text-left outline-none transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${slice.color}26` }}
          >
            {createElement(Icon, { className: "h-4 w-4", style: { color: slice.color } })}
          </div>
          <div className="min-w-0 flex-1">
            <Words
              type="sm/regular"
              as="span"
              className="block truncate text-ink-700 dark:text-ink-300"
            >
              {name}
            </Words>
            <Words type="xs/regular" as="span" className="block text-ink-400 dark:text-ink-500">
              {t("wallet.transactionCount", { n: slice.count })}
            </Words>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <Words
              type="sm/bold"
              as="span"
              className="whitespace-nowrap text-ink-900 dark:text-ink-50"
            >
              {hasLimit
                ? `${formatAmount(slice.spent)} / ${formatAmount(slice.limit as number)}`
                : formatAmount(slice.spent)}
            </Words>
            <Words
              type="xxs/bold"
              as="span"
              className={cn(
                "text-ink-400 dark:text-ink-500",
                isOverLimit && "text-red-500 dark:text-red-400",
              )}
            >
              {hasLimit ? `${Math.round(percentage)}%` : t("budget.noLimitSet")}
            </Words>
          </div>
        </button>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={t("budget.toggleBreakdown")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-300 transition-colors hover:bg-ink-100 dark:text-ink-600 dark:hover:bg-ink-800"
          >
            <HiOutlineChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                isExpanded && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {hasLimit && (
        <div className="ml-[46px] h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${Math.min(100, percentage)}%`,
              backgroundColor: isOverLimit ? "#EF4444" : slice.color,
            }}
          />
        </div>
      )}
    </div>
  );
}

interface BudgetCategoryRowProps {
  slice: BudgetSlice;
  subSlices: BudgetSlice[];
  isExpanded: boolean;
  isDimmed: boolean;
  onToggle: () => void;
  onHoverSlice: (id: string | null) => void;
  formatAmount: (value: number) => string;
  onSelectSlice: (slice: BudgetSlice, parentSlice?: BudgetSlice) => void;
}

function BudgetCategoryRow({
  slice,
  subSlices,
  isExpanded,
  isDimmed,
  onToggle,
  onHoverSlice,
  formatAmount,
  onSelectSlice,
}: BudgetCategoryRowProps) {
  const { t } = useTranslation();
  const hasSubCategories = (slice.subSlices?.length ?? 0) > 0;
  const hasLimit = slice.limit !== null && slice.limit > 0;
  const subLimitTotal = subSlices.reduce((sum, sub) => sum + (sub.limit ?? 0), 0);
  const isOverCategoryLimit = hasLimit && subLimitTotal > (slice.limit as number);

  return (
    <div className={cn("flex flex-col transition-opacity duration-300", isDimmed && "opacity-40")}>
      <BudgetSliceRow
        slice={slice}
        formatAmount={formatAmount}
        onSelect={() => onSelectSlice(slice)}
        onToggle={hasSubCategories ? onToggle : undefined}
        isExpanded={isExpanded}
        onHoverChange={(isHovering) => onHoverSlice(isHovering ? slice.id : null)}
      />

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1">
            {subLimitTotal > 0 && (
              <div className="ml-[46px] flex items-baseline gap-2 py-1">
                <Words
                  type="xxs/regular"
                  as="span"
                  className="shrink-0 whitespace-nowrap text-ink-400 dark:text-ink-500"
                >
                  {t("budget.categoryTotalLabel", { name: slice.name ?? t("dashboard.otherSubCategory") })}
                </Words>
                <span className="h-0 flex-1 border-b border-dotted border-ink-300 dark:border-ink-700" />
                <Words
                  type="xxs/bold"
                  as="span"
                  className={cn(
                    "shrink-0 whitespace-nowrap text-ink-400 dark:text-ink-500",
                    isOverCategoryLimit && "text-red-500 dark:text-red-400",
                  )}
                >
                  {hasLimit
                    ? `${formatAmount(subLimitTotal)} / ${formatAmount(slice.limit as number)}`
                    : formatAmount(subLimitTotal)}
                </Words>
              </div>
            )}
            {subSlices.map((sub) => (
              <BudgetSliceRow
                key={sub.id}
                slice={sub}
                formatAmount={formatAmount}
                onSelect={() => onSelectSlice(sub, slice)}
                onHoverChange={(isHovering) => onHoverSlice(isHovering ? sub.id : null)}
                isSubCategory
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BudgetBreakdownList({
  slices,
  title,
  periodLabel,
  isLoading = false,
  onSelectSlice,
  allocatedLimit = 0,
  totalLimit = 0,
}: BudgetBreakdownListProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);

  const expandedSlice = expandedId ? slices.find((item) => item.id === expandedId) : undefined;
  const detailSlices = expandedSlice?.subSlices ?? [];
  const activeSlices = expandedSlice ? detailSlices : slices;
  const activeTotal = activeSlices.reduce((sum, slice) => sum + slice.spent, 0);
  const isEmpty = slices.length === 0;
  const centerLabel = expandedSlice
    ? (expandedSlice.name ?? t("dashboard.otherSubCategory"))
    : t("dashboard.totalExpense");

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleOverviewClick(id: string) {
    const clicked = slices.find((item) => item.id === id);
    if (!clicked) return;

    if ((clicked.subSlices?.length ?? 0) > 0) {
      handleToggle(id);
    } else {
      onSelectSlice(clicked);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
          {title}
        </Words>
        <span className="shrink-0 rounded-full bg-ink-100 px-3 py-1.5 dark:bg-ink-800">
          <Words type="xs/bold" as="span" className="text-ink-600 dark:text-ink-300">
            {periodLabel}
          </Words>
        </span>
      </div>

      <div className="relative">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-10 dark:border-ink-800">
            <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
              {t("budget.noRowsAvailable")}
            </Words>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <DonutChart
              data={activeSlices.map(
                (slice): DonutChartDatum => ({
                  id: slice.id,
                  label: slice.name ?? t("dashboard.otherSubCategory"),
                  value: slice.spent,
                  color: slice.color,
                }),
              )}
              size={180}
              thickness={24}
              centerLabel={centerLabel}
              centerValue={format(activeTotal)}
              formatValue={format}
              activeId={hoveredSliceId}
              onSliceClick={!expandedSlice ? (datum) => handleOverviewClick(datum.id) : undefined}
            />

            <div className="flex w-full min-w-0 flex-1 flex-col gap-1">
              {allocatedLimit > 0 && (
                <Words
                  type="xxs/regular"
                  as="span"
                  className="px-1 pb-1 text-ink-400 dark:text-ink-500"
                >
                  {t("budget.allocatedLimitHint", {
                    allocated: format(allocatedLimit),
                    total: format(totalLimit),
                  })}
                </Words>
              )}
              {slices.map((slice) => (
                <BudgetCategoryRow
                  key={slice.id}
                  slice={slice}
                  subSlices={expandedId === slice.id ? detailSlices : []}
                  isExpanded={expandedId === slice.id}
                  isDimmed={expandedId !== null && expandedId !== slice.id}
                  onToggle={() => handleToggle(slice.id)}
                  onHoverSlice={setHoveredSliceId}
                  formatAmount={format}
                  onSelectSlice={onSelectSlice}
                />
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-12 backdrop-blur-[2px] dark:bg-ink-950/60">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
}
