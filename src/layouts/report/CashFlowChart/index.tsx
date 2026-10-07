import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChartLine } from "react-icons/lu";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
} from "recharts";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SectionHead } from "@/components/molecules/SectionHead";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { ChartTooltip } from "@/components/molecules/ChartTooltip";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import type { CashFlowDisplayMode, CashFlowPoint } from "@/types/report.types";

type CashFlowSeries = "income" | "expense";

const SERIES: CashFlowSeries[] = ["income", "expense"];

const SERIES_COLOR: Record<CashFlowSeries, string> = {
  income: "var(--chart-1)",
  expense: "var(--chart-2)",
};

const DISPLAY_MODES: CashFlowDisplayMode[] = ["cumulative", "period"];

interface CashFlowChartProps {
  data: CashFlowPoint[];
  /** Small uppercase label above the title (e.g. "LAPORAN · ARUS KAS"). */
  eyebrow?: string;
  isLoading?: boolean;
}

function toCumulative(data: CashFlowPoint[]): CashFlowPoint[] {
  let cumulativeIncome = 0;
  let cumulativeExpense = 0;
  return data.map((point) => {
    cumulativeIncome += point.income;
    cumulativeExpense += point.expense;
    return { ...point, income: cumulativeIncome, expense: cumulativeExpense };
  });
}

/** Marks today's bucket with a persistent dot (same treatment as the hover dot). */
function renderTodayDot(color: string) {
  return ({ cx, cy, payload, index }: DotItemDotProps) => {
    if (!payload.isToday) return null;
    return (
      <circle
        key={`today-${index}`}
        cx={cx}
        cy={cy}
        r={5.5}
        fill={color}
        stroke="var(--surface)"
        strokeWidth={2.5}
      />
    );
  };
}

export function CashFlowChart({ data, eyebrow, isLoading = false }: CashFlowChartProps) {
  const { t } = useTranslation();
  const { format, formatCompact } = useMoneyFormat();
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [mode, setMode] = useState<CashFlowDisplayMode>("cumulative");
  const [hiddenSeries, setHiddenSeries] = useState<Set<CashFlowSeries>>(new Set());

  const isEmpty = data.every((point) => point.income === 0 && point.expense === 0);
  const chartData = useMemo(
    () => (mode === "cumulative" ? toCumulative(data) : data),
    [data, mode],
  );

  function toggleSeries(series: CashFlowSeries) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(series)) next.delete(series);
      else next.add(series);
      return next;
    });
  }

  const modeOptions = DISPLAY_MODES.map((option) => ({
    value: option,
    label: t(`reports.cashFlow.modes.${option}`),
  }));

  const legend = (
    <div className="flex items-center gap-3 sm:gap-4">
      {SERIES.map((series) => {
        const isHidden = hiddenSeries.has(series);
        return (
          <button
            key={series}
            type="button"
            onClick={() => toggleSeries(series)}
            aria-pressed={!isHidden}
            className={cn(
              "pressable inline-flex items-center gap-1.5 rounded-full text-[12px] sm:text-[12.5px]",
              isHidden ? "text-text-3 line-through opacity-70" : "text-text-2 hover:text-text",
            )}
          >
            <span
              className="size-[9px] shrink-0 rounded-full transition-opacity"
              style={{ backgroundColor: SERIES_COLOR[series], opacity: isHidden ? 0.4 : 1 }}
            />
            <span className="sm:hidden">{t(`reports.cashFlow.short.${series}`)}</span>
            <span className="hidden sm:inline">{t(`reports.cashFlow.${series}`)}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <Card className="flex flex-col gap-4 lg:gap-[18px]">
      <SectionHead
        eyebrow={eyebrow}
        title={t("reports.cashFlow.title")}
        right={
          <>
            {legend}
            <div className="hidden sm:block">
              <SegmentedControl
                options={modeOptions}
                value={mode}
                onChange={setMode}
                ariaLabel={t("reports.cashFlow.title")}
              />
            </div>
          </>
        }
      />

      <div className="relative">
        {isEmpty ? (
          <EmptyState
            icon={<LuChartLine />}
            title={t("reports.cashFlow.empty")}
            className="h-[200px] sm:h-[253px]"
          />
        ) : (
          <div className="h-[200px] w-full sm:h-[270px] [&_*]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  {SERIES.map((series) => (
                    <linearGradient
                      key={series}
                      id={`${gradientId}-${series}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={SERIES_COLOR[series]} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={SERIES_COLOR[series]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-3)", fontSize: 11 }}
                  tickMargin={8}
                  minTickGap={16}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{ fill: "var(--text-3)", fontSize: 11 }}
                  tickFormatter={formatCompact}
                />
                <Tooltip
                  cursor={{ stroke: "var(--text-3)", strokeOpacity: 0.35, strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltip
                        title={label}
                        rows={payload.map((entry) => {
                          const series = entry.dataKey as CashFlowSeries;
                          return {
                            key: series,
                            label: t(`reports.cashFlow.${series}`),
                            value: format(Number(entry.value)),
                            color: SERIES_COLOR[series],
                          };
                        })}
                      />
                    );
                  }}
                />
                {SERIES.map((series) => (
                  <Area
                    key={series}
                    type="monotone"
                    dataKey={series}
                    name={series}
                    stroke={SERIES_COLOR[series]}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={`url(#${gradientId}-${series})`}
                    dot={renderTodayDot(SERIES_COLOR[series])}
                    activeDot={{
                      r: 7,
                      fill: SERIES_COLOR[series],
                      stroke: "var(--surface)",
                      strokeWidth: 3,
                    }}
                    animationDuration={600}
                    hide={hiddenSeries.has(series)}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex animate-fade-in items-start justify-center rounded-control bg-surface/60 pt-14 backdrop-blur-[2px]">
            <IconLoader className="size-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="sm:hidden">
        <SegmentedControl
          options={modeOptions}
          value={mode}
          onChange={setMode}
          fill
          ariaLabel={t("reports.cashFlow.title")}
        />
      </div>
    </Card>
  );
}
