import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuChevronDown, LuChevronRight, LuInfo, LuTags } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { DonutChart, type DonutChartDatum } from "@/components/molecules/DonutChart";
import { EmptyState } from "@/components/molecules/EmptyState";
import { BudgetPercentBadge } from "@/layouts/budget/BudgetPercentBadge";
import { useMoneyFormat } from "@/hooks/use-money-format";
import type { BudgetSlice, BudgetStatus } from "@/utils/budget-breakdown";
import { cn } from "@/utils/cn";

interface BudgetBreakdownListProps {
  /** Already-aggregated rows from `buildBudgetSlices` — this component never reduces raw data itself. */
  slices: BudgetSlice[];
  /** First load only (spending or categories not in yet) — shows skeleton rows. */
  isLoading?: boolean;
  /** `parentSlice` is present only when the clicked row is a subcategory nested under an expanded category row. */
  onSelectSlice: (slice: BudgetSlice, parentSlice?: BudgetSlice) => void;
  /** Sum of every category-level limit set under the budget — 0 hides the banner. */
  allocatedLimit?: number;
  /** The budget's own overall limit, paired with `allocatedLimit` in the banner. */
  totalLimit?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

interface RowMetrics {
  hasLimit: boolean;
  ratio: number;
  percent: number;
  status: BudgetStatus;
}

/** Rows only flag going over — the amber "almost" state is for whole budgets. */
function getRowMetrics(slice: BudgetSlice): RowMetrics {
  const hasLimit = slice.limit !== null && slice.limit > 0;
  const ratio = hasLimit ? slice.spent / (slice.limit as number) : 0;
  return { hasLimit, ratio, percent: Math.round(ratio * 100), status: ratio > 1 ? "over" : "ok" };
}

function sumLimits(slices: BudgetSlice[]): number {
  return slices.reduce((sum, slice) => sum + (slice.limit ?? 0), 0);
}

export function BudgetBreakdownList({
  slices,
  isLoading = false,
  onSelectSlice,
  allocatedLimit = 0,
  totalLimit = 0,
}: BudgetBreakdownListProps) {
  const { t } = useTranslation();
  const { format, formatNumber, formatCompact } = useMoneyFormat();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const expandedSlice = expandedId ? slices.find((item) => item.id === expandedId) : undefined;
  const activeSlices = expandedSlice?.subSlices ?? slices;
  const activeTotal = activeSlices.reduce((sum, slice) => sum + slice.spent, 0);
  const isOverAllocated = allocatedLimit > totalLimit;
  const otherLabel = t("dashboard.otherSubCategory");

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleDonutClick(id: string) {
    const clicked = slices.find((item) => item.id === id);
    if (!clicked) return;
    if ((clicked.subSlices?.length ?? 0) > 0) handleToggle(id);
    else onSelectSlice(clicked);
  }

  const allocatedBanner = allocatedLimit > 0 && (
    <span
      className={cn(
        "flex items-center gap-2 rounded-control px-3.5 py-2 text-[12.5px] font-semibold lg:rounded-full",
        isOverAllocated
          ? "bg-expense-soft text-expense-text"
          : "bg-investment-soft text-investment-text",
      )}
    >
      <LuInfo className="size-3.5 shrink-0" />
      <span className="truncate lg:hidden">
        {t("budget.allocatedShort", {
          allocated: formatCompact(allocatedLimit),
          total: formatCompact(totalLimit),
        })}
      </span>
      <span className="hidden truncate lg:inline">
        {t("budget.allocatedLimitHint", {
          allocated: format(allocatedLimit),
          total: formatNumber(totalLimit),
        })}
      </span>
    </span>
  );

  return (
    <Card className="flex flex-col gap-4 lg:gap-[18px]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="hidden text-[11px] font-semibold tracking-[0.08em] text-text-3 uppercase lg:block">
            {t("budget.breakdownEyebrow")}
          </span>
          <h2 className="font-display text-[18px] font-semibold text-text">
            {t("budget.breakdownTitle")}
          </h2>
        </div>
        {allocatedBanner}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 rounded-control" />
          ))}
        </div>
      ) : slices.length === 0 ? (
        <EmptyState icon={<LuTags />} title={t("budget.noRowsAvailable")} />
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="hidden shrink-0 lg:block">
            {activeTotal > 0 ? (
              <DonutChart
                data={activeSlices
                  .filter((slice) => slice.spent > 0)
                  .map((slice): DonutChartDatum => ({
                    id: slice.id,
                    label: slice.name ?? otherLabel,
                    value: slice.spent,
                    color: slice.color,
                  }))}
                size={236}
                thickness={24}
                centerLabel={
                  expandedSlice ? (expandedSlice.name ?? otherLabel) : t("budget.spentCaption")
                }
                centerValue={formatCompact(activeTotal)}
                formatValue={formatCompact}
                activeId={hoveredId}
                onSliceClick={!expandedSlice ? (datum) => handleDonutClick(datum.id) : undefined}
              />
            ) : (
              <div className="m-2 flex size-[220px] flex-col items-center justify-center rounded-full border-[24px] border-surface-2">
                <span className="font-display text-[24px] font-semibold text-text">
                  {formatCompact(0)}
                </span>
                <span className="text-[12px] text-text-3">{t("budget.spentCaption")}</span>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {slices.map((slice) => (
              <BudgetCategoryRow
                key={slice.id}
                slice={slice}
                isExpanded={expandedId === slice.id}
                onToggle={() => handleToggle(slice.id)}
                onHover={setHoveredId}
                onSelectSlice={onSelectSlice}
              />
            ))}
          </div>
        </div>
      )}

      {slices.length > 0 && (
        <p className="hidden text-[12.5px] text-text-3 lg:block">{t("budget.tapRowHint")}</p>
      )}
    </Card>
  );
}

interface BudgetCategoryRowProps {
  slice: BudgetSlice;
  isExpanded: boolean;
  onToggle: () => void;
  onHover: (id: string | null) => void;
  onSelectSlice: (slice: BudgetSlice, parentSlice?: BudgetSlice) => void;
}

function BudgetCategoryRow({
  slice,
  isExpanded,
  onToggle,
  onHover,
  onSelectSlice,
}: BudgetCategoryRowProps) {
  const { t } = useTranslation();
  const { format, formatNumber, formatCompact } = useMoneyFormat();
  const subSlices = slice.subSlices ?? [];
  const hasSubs = subSlices.length > 0;
  const metrics = getRowMetrics(slice);
  const name = slice.name ?? t("dashboard.otherSubCategory");
  const subLimitTotal = sumLimits(subSlices);
  const isSubLimitOver = metrics.hasLimit && subLimitTotal > (slice.limit as number);
  const amountClass = metrics.status === "over" ? "text-expense-text" : "text-text-2";

  return (
    <div
      onMouseEnter={() => onHover(slice.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "flex flex-col rounded-control transition-colors duration-200",
        isExpanded
          ? "bg-surface-2 lg:bg-transparent"
          : "hover:bg-surface-2/60 lg:hover:bg-transparent",
      )}
    >
      {/* Desktop row */}
      <div
        className={cn(
          "hidden items-center gap-3.5 rounded-control px-4 transition-colors duration-200 lg:flex",
          isExpanded ? "bg-surface-2" : "hover:bg-surface-2/60",
        )}
      >
        {hasSubs ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={t("budget.toggleBreakdown")}
            className="-mx-1.5 flex size-7 shrink-0 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-surface-3 hover:text-text"
          >
            <LuChevronRight
              className={cn("size-4 transition-transform duration-300", isExpanded && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-4 shrink-0" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={() => onSelectSlice(slice)}
          className="flex min-w-0 flex-1 items-center gap-3.5 py-3 text-left"
        >
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: slice.color }}
          />
          <span className="w-[180px] shrink-0 truncate text-[14px] font-semibold text-text">
            {name}
          </span>
          <RowMeter slice={slice} metrics={metrics} />
          <span
            className={cn(
              "w-[190px] shrink-0 truncate text-right font-num text-[13px] tabular",
              amountClass,
            )}
          >
            {metrics.hasLimit
              ? `${formatNumber(slice.spent)} / ${formatNumber(slice.limit as number)}`
              : formatNumber(slice.spent)}
          </span>
          <span className="flex w-[54px] shrink-0 justify-end">
            {metrics.hasLimit && (
              <BudgetPercentBadge
                percent={metrics.percent}
                status={metrics.status}
                className={cn(
                  "px-2 py-[3px] text-[11.5px]",
                  isExpanded && metrics.status === "ok" && "bg-surface",
                )}
              />
            )}
          </span>
        </button>
      </div>

      {/* Phone row */}
      <div className="flex flex-col gap-2 px-3 py-2.5 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectSlice(slice)}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          >
            <span
              className="size-[9px] shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-text">
              {name}
            </span>
            <span className={cn("shrink-0 font-num text-[12.5px] tabular", amountClass)}>
              {metrics.hasLimit
                ? `${formatCompact(slice.spent)} / ${formatCompact(slice.limit as number)}`
                : formatCompact(slice.spent)}
            </span>
          </button>
          {hasSubs ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isExpanded}
              aria-label={t("budget.toggleBreakdown")}
              className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-full text-text-3"
            >
              <LuChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  isExpanded && "rotate-180",
                )}
              />
            </button>
          ) : (
            <span className="w-6 shrink-0" aria-hidden="true" />
          )}
        </div>
        {metrics.hasLimit ? (
          <button
            type="button"
            onClick={() => onSelectSlice(slice)}
            className="block"
            tabIndex={-1}
            aria-hidden="true"
          >
            <MeterTrack
              ratio={metrics.ratio}
              color={metrics.status === "over" ? "var(--expense)" : slice.color}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectSlice(slice)}
            className="text-left text-[12px] text-text-3"
            tabIndex={-1}
          >
            {t("budget.noLimitTapHint")}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasSubs && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 px-3 pb-2.5 lg:px-0 lg:pt-1.5 lg:pb-0">
              {subSlices.map((sub) => (
                <BudgetSubRow
                  key={sub.id}
                  slice={sub}
                  onHover={onHover}
                  onSelect={() => onSelectSlice(sub, slice)}
                />
              ))}
              {subLimitTotal > 0 && (
                <div className="hidden items-center gap-2.5 pt-1 pr-4 pb-2.5 pl-11 text-[12px] text-text-3 lg:flex">
                  <span className="shrink-0">{t("budget.subLimitTotal")}</span>
                  <span className="h-0 flex-1 border-b border-dotted border-border-strong" />
                  <span
                    className={cn(
                      "shrink-0 font-num tabular",
                      isSubLimitOver && "text-expense-text",
                    )}
                  >
                    {metrics.hasLimit
                      ? t("budget.subLimitOf", {
                          allocated: format(subLimitTotal),
                          total: formatNumber(slice.limit as number),
                        })
                      : format(subLimitTotal)}
                  </span>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BudgetSubRowProps {
  slice: BudgetSlice;
  onHover: (id: string | null) => void;
  onSelect: () => void;
}

function BudgetSubRow({ slice, onHover, onSelect }: BudgetSubRowProps) {
  const { t } = useTranslation();
  const { formatNumber, formatCompact } = useMoneyFormat();
  const metrics = getRowMetrics(slice);
  const name = slice.name ?? t("dashboard.otherSubCategory");
  const amountClass = metrics.status === "over" ? "text-expense-text" : "text-text-2";

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={(event) => {
        event.stopPropagation();
        onHover(slice.id);
      }}
      className="flex w-full items-center gap-3 rounded-[12px] px-2 py-1.5 text-left transition-colors duration-200 hover:bg-surface-3/60 lg:gap-3.5 lg:rounded-[14px] lg:bg-bg lg:py-2.5 lg:pr-4 lg:pl-11 lg:hover:bg-surface-2/70"
    >
      <span
        className="hidden size-[7px] shrink-0 rounded-full lg:block"
        style={{ backgroundColor: slice.color }}
      />
      <span className="min-w-0 flex-1 truncate text-[13px] text-text lg:w-[180px] lg:flex-none lg:font-medium">
        {name}
      </span>
      <span className="hidden min-w-0 flex-1 lg:flex">
        <RowMeter slice={slice} metrics={metrics} />
      </span>
      <span className={cn("shrink-0 font-num text-[12px] tabular lg:hidden", amountClass)}>
        {metrics.hasLimit
          ? `${formatCompact(slice.spent)} / ${formatCompact(slice.limit as number)}`
          : formatCompact(slice.spent)}
      </span>
      <span
        className={cn(
          "hidden w-[190px] shrink-0 truncate text-right font-num text-[13px] tabular lg:block",
          amountClass,
        )}
      >
        {metrics.hasLimit
          ? `${formatNumber(slice.spent)} / ${formatNumber(slice.limit as number)}`
          : formatNumber(slice.spent)}
      </span>
      <span className="hidden w-[54px] shrink-0 justify-end lg:flex">
        {metrics.hasLimit && (
          <BudgetPercentBadge
            percent={metrics.percent}
            status={metrics.status}
            className="px-2 py-[3px] text-[11.5px]"
          />
        )}
      </span>
    </button>
  );
}

/** Desktop middle column: the limit bar, or a "no limit yet" pill. */
function RowMeter({ slice, metrics }: { slice: BudgetSlice; metrics: RowMetrics }) {
  const { t } = useTranslation();

  if (!metrics.hasLimit) {
    return (
      <span className="flex min-w-0 flex-1">
        <span className="truncate rounded-full border border-border px-2.5 py-[3px] text-[11.5px] text-text-3">
          {t("budget.noLimitSet")}
        </span>
      </span>
    );
  }

  return (
    <span className="min-w-0 flex-1">
      <MeterTrack
        ratio={metrics.ratio}
        color={metrics.status === "over" ? "var(--expense)" : slice.color}
      />
    </span>
  );
}

function MeterTrack({ ratio, color }: { ratio: number; color: string }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-3/70">
      <m.span
        className="block h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(1, Math.max(0, ratio)) * 100}%` }}
        transition={{ duration: 0.7, ease: EASE }}
      />
    </span>
  );
}
