import { createElement, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuArrowLeft, LuChartPie, LuChevronRight, LuTag } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { DonutChart, type DonutChartDatum } from "@/components/molecules/DonutChart";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SectionHead } from "@/components/molecules/SectionHead";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import {
  OTHER_SUB_CATEGORY_ID,
  type CategorySlice as ChartSlice,
} from "@/utils/category-breakdown";

interface CategoryBreakdownChartProps {
  /** Already-aggregated slices — from the API summary (Dashboard) or
   * `buildCategoryBreakdown()` (Reports). This component never reduces a
   * raw transaction list itself. */
  slices: ChartSlice[];
  title: string;
  /** Shown as the card eyebrow ("BULAN INI", a report period…). */
  periodLabel: string;
  headerAction?: ReactNode;
  /** "Laporan →" style link in the header. */
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
  /** Caption under the donut total (defaults to "total keluar"). */
  centerCaption?: string;
  /** When provided, subcategory tiles become clickable. */
  onSelectSubCategory?: (subSlice: ChartSlice, categorySlice: ChartSlice) => void;
  /** When provided, a category tile is clickable directly instead of drilling
   * in — used when the category has no subcategories to drill into, and for the
   * "Other" bucket inside a drilled-in category (it has no real subcategory id
   * to navigate with, only the parent category). */
  onSelectCategory?: (categorySlice: ChartSlice) => void;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

interface SliceTileProps {
  slice: ChartSlice;
  name: string;
  value: string;
  onClick?: () => void;
  onHoverChange: (isHovering: boolean) => void;
  hasChildren: boolean;
}

function SliceTile({ slice, name, value, onClick, onHoverChange, hasChildren }: SliceTileProps) {
  const Tag = onClick ? "button" : "div";
  const Icon = slice.icon ? resolveCategoryIcon(slice.icon) : LuTag;

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      className={cn(
        "group flex w-full min-w-0 items-center gap-2.5 rounded-control bg-surface-2 p-3 text-left transition-colors duration-200",
        onClick && "pressable hover:bg-surface-3",
      )}
    >
      <span
        className="flex size-[34px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: `${slice.color}26`, color: slice.color }}
      >
        {createElement(Icon, { className: "size-4" })}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-[12.5px] text-text-2">{name}</span>
        <span className="truncate font-num text-[14px] font-semibold text-text tabular">
          {value}
        </span>
      </span>
      <span className="shrink-0 text-[12.5px] font-semibold text-text-3 tabular">
        {Math.round(slice.percentage)}%
      </span>
      {hasChildren && (
        <LuChevronRight className="-ml-1 size-3.5 shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </Tag>
  );
}

/** "Pengeluaran per kategori": rounded donut + category tiles, drill-down into subcategories. */
export function CategoryBreakdownChart({
  slices,
  title,
  periodLabel,
  headerAction,
  actionLabel,
  onAction,
  isLoading = false,
  centerCaption,
  onSelectSubCategory,
  onSelectCategory,
  className,
}: CategoryBreakdownChartProps) {
  const { t } = useTranslation();
  const { formatNumber, formatCompact } = useMoneyFormat();
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);

  const expandedCategory = expandedCategoryId
    ? slices.find((item) => item.id === expandedCategoryId)
    : undefined;
  const activeSlices = expandedCategory ? (expandedCategory.subSlices ?? []) : slices;
  const activeTotal = activeSlices.reduce((sum, slice) => sum + slice.total, 0);
  const nameOf = (slice: ChartSlice) => slice.name ?? t("dashboard.otherSubCategory");
  const isEmpty = slices.length === 0;
  const isInitialLoading = isLoading && isEmpty;

  function handleCategoryClick(slice: ChartSlice) {
    if ((slice.subSlices?.length ?? 0) > 0) {
      setHoveredSliceId(null);
      setExpandedCategoryId(slice.id);
    } else {
      onSelectCategory?.(slice);
    }
  }

  function tileClickFor(slice: ChartSlice): (() => void) | undefined {
    if (!expandedCategory) {
      const canDrill = (slice.subSlices?.length ?? 0) > 0;
      return canDrill || onSelectCategory ? () => handleCategoryClick(slice) : undefined;
    }
    if (slice.id === OTHER_SUB_CATEGORY_ID) {
      return onSelectCategory ? () => onSelectCategory(expandedCategory) : undefined;
    }
    return onSelectSubCategory ? () => onSelectSubCategory(slice, expandedCategory) : undefined;
  }

  return (
    <Card className={cn("flex flex-col gap-[18px]", className)}>
      <SectionHead
        eyebrow={periodLabel}
        title={title}
        right={headerAction}
        actionLabel={actionLabel}
        onAction={onAction}
      />

      {isInitialLoading ? (
        <div className="flex flex-col items-center gap-6 @container sm:flex-row" aria-busy="true">
          <Skeleton className="size-[180px] shrink-0 rounded-full" />
          <div className="grid w-full flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-[58px] rounded-control" />
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        <EmptyState icon={<LuChartPie />} title={t("dashboard.noExpenseData")} />
      ) : (
        <div
          className={cn("@container transition-opacity duration-300", isLoading && "opacity-60")}
        >
          <div className="flex flex-col items-center gap-6 @2xl:flex-row @2xl:items-start @2xl:gap-8">
            <DonutChart
              key={expandedCategoryId ?? "all"}
              data={activeSlices.map((slice): DonutChartDatum => ({
                id: slice.id,
                label: nameOf(slice),
                value: slice.total,
                color: slice.color,
              }))}
              size={180}
              thickness={26}
              centerValue={formatCompact(activeTotal)}
              centerLabel={
                expandedCategory
                  ? nameOf(expandedCategory)
                  : (centerCaption ?? t("dashboard.totalExpenseShort"))
              }
              formatValue={formatCompact}
              activeId={hoveredSliceId}
              onSliceClick={(datum) => {
                const slice = activeSlices.find((item) => item.id === datum.id);
                const click = slice ? tileClickFor(slice) : undefined;
                click?.();
              }}
            />

            <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
              <AnimatePresence initial={false}>
                {expandedCategory && (
                  <m.button
                    key="back"
                    type="button"
                    onClick={() => {
                      setHoveredSliceId(null);
                      setExpandedCategoryId(null);
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="group flex items-center gap-1.5 self-start overflow-hidden text-[13px] font-semibold text-primary-text"
                  >
                    <LuArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    {t("dashboard.backToCategories")}
                    <span className="font-normal text-text-3">· {nameOf(expandedCategory)}</span>
                  </m.button>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={expandedCategoryId ?? "all"}
                  initial={{ opacity: 0, x: expandedCategory ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: expandedCategory ? -12 : 12 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="grid grid-cols-1 gap-3 @md:grid-cols-2"
                >
                  {activeSlices.map((slice) => (
                    <SliceTile
                      key={slice.id}
                      slice={slice}
                      name={nameOf(slice)}
                      value={formatNumber(slice.total)}
                      onClick={tileClickFor(slice)}
                      hasChildren={!expandedCategory && (slice.subSlices?.length ?? 0) > 0}
                      onHoverChange={(isHovering) =>
                        setHoveredSliceId(isHovering ? slice.id : null)
                      }
                    />
                  ))}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
