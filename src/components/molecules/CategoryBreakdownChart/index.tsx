import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineChevronDown, HiOutlineTag } from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { DonutChart, type DonutChartDatum } from "@/components/molecules/DonutChart";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/utils/cn";
import type { CategorySlice as ChartSlice } from "@/utils/category-breakdown";

interface CategoryBreakdownChartProps {
  /** Already-aggregated slices — from the API summary (Dashboard) or
   * `buildCategoryBreakdown()` (Reports). This component never reduces a
   * raw transaction list itself. */
  slices: ChartSlice[];
  title: string;
  periodLabel: string;
  isLoading?: boolean;
}

interface SliceRowProps {
  slice: ChartSlice;
  formatAmount: (value: number) => string;
  onClick?: () => void;
  isExpanded?: boolean;
  onHoverChange?: (isHovering: boolean) => void;
  isSubCategory?: boolean;
}

function SliceRow({
  slice,
  formatAmount,
  onClick,
  isExpanded,
  onHoverChange,
  isSubCategory,
}: SliceRowProps) {
  const { t } = useTranslation();
  const Icon = slice.icon ? resolveCategoryIcon(slice.icon) : HiOutlineTag;
  const Tag = onClick ? "button" : "div";
  const name = slice.name ?? t("dashboard.otherSubCategory");

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      onMouseEnter={onHoverChange ? () => onHoverChange(true) : undefined}
      onMouseLeave={onHoverChange ? () => onHoverChange(false) : undefined}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-1 py-1 text-left outline-none transition-colors",
        onClick && "hover:bg-ink-50 dark:hover:bg-ink-800",
        isSubCategory && "px-6",
      )}
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
        <Words type="xxs/regular" as="span" className="block text-ink-400 dark:text-ink-500">
          {t("wallet.transactionCount", { n: slice.count })}
        </Words>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex flex-col items-end gap-0.5">
          <Words
            type="sm/bold"
            as="span"
            className="whitespace-nowrap text-ink-900 dark:text-ink-50"
          >
            {formatAmount(slice.total)}
          </Words>
          <Words type="xxs/bold" as="span" className="text-ink-400 dark:text-ink-500">
            {Math.round(slice.percentage)}%
          </Words>
        </div>
        {isExpanded !== undefined && (
          <HiOutlineChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-ink-300 transition-transform duration-300 dark:text-ink-600",
              isExpanded && "rotate-180",
            )}
          />
        )}
      </div>
    </Tag>
  );
}

interface CategoryRowProps {
  slice: ChartSlice;
  subSlices: ChartSlice[];
  isExpanded: boolean;
  isDimmed: boolean;
  onToggle: () => void;
  onHoverSlice: (id: string | null) => void;
  formatAmount: (value: number) => string;
}

function CategoryRow({
  slice,
  subSlices,
  isExpanded,
  isDimmed,
  onToggle,
  onHoverSlice,
  formatAmount,
}: CategoryRowProps) {
  return (
    <div className={cn("flex flex-col transition-opacity duration-300", isDimmed && "opacity-40")}>
      <SliceRow
        slice={slice}
        formatAmount={formatAmount}
        onClick={onToggle}
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
            {subSlices.map((sub) => (
              <SliceRow
                key={sub.id}
                slice={sub}
                formatAmount={formatAmount}
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

export function CategoryBreakdownChart({
  slices,
  title,
  periodLabel,
  isLoading = false,
}: CategoryBreakdownChartProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);

  const overviewSlices = slices;
  const expandedCategory = expandedCategoryId
    ? overviewSlices.find((item) => item.id === expandedCategoryId)
    : undefined;
  const detailSlices = expandedCategory?.subSlices ?? [];

  const isEmpty = overviewSlices.length === 0;
  const activeSlices = expandedCategory ? detailSlices : overviewSlices;
  const activeTotal = activeSlices.reduce((sum, slice) => sum + slice.total, 0);
  const centerLabel = expandedCategory
    ? t("dashboard.totalOfCategory", { category: expandedCategory.name ?? t("dashboard.otherSubCategory") })
    : t("dashboard.totalExpense");

  function handleToggle(idCategory: string) {
    setExpandedCategoryId((prev) => (prev === idCategory ? null : idCategory));
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
          {title}
        </Words>
        <span className="shrink-0 rounded-full bg-ink-100 px-3 py-1.5 dark:bg-ink-800">
          <Words type="xs/bold" as="span" className="text-ink-600 dark:text-ink-300 flex items-center justify-center">
            {periodLabel}
          </Words>
        </span>
      </div>

      <div className="relative">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-10 dark:border-ink-800">
            <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
              {t("dashboard.noExpenseData")}
            </Words>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <DonutChart
              data={activeSlices.map((slice): DonutChartDatum => ({
                id: slice.id,
                label: slice.name ?? t("dashboard.otherSubCategory"),
                value: slice.total,
                color: slice.color,
              }))}
              size={180}
              thickness={24}
              centerLabel={centerLabel}
              centerValue={format(activeTotal)}
              formatValue={format}
              activeId={hoveredSliceId}
              onSliceClick={!expandedCategory ? (datum) => handleToggle(datum.id) : undefined}
            />

            <div className="flex w-full min-w-0 flex-1 flex-col gap-1">
              {overviewSlices.map((slice) => (
                <CategoryRow
                  key={slice.id}
                  slice={slice}
                  subSlices={expandedCategoryId === slice.id ? detailSlices : []}
                  isExpanded={expandedCategoryId === slice.id}
                  isDimmed={expandedCategoryId !== null && expandedCategoryId !== slice.id}
                  onToggle={() => handleToggle(slice.id)}
                  onHoverSlice={setHoveredSliceId}
                  formatAmount={format}
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
