import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
} from "recharts";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/utils/cn";
import type { CashFlowDisplayMode, CashFlowPoint } from "@/types/report.types";

const INCOME_COLOR = "#23ac82";
const EXPENSE_COLOR = "#ef4444";

const DISPLAY_MODES: CashFlowDisplayMode[] = ["cumulative", "period"];

type CashFlowSeries = "income" | "expense";

interface CashFlowChartProps {
  data: CashFlowPoint[];
  periodLabel: string;
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

function renderTodayDot(color: string) {
  return ({ cx, cy, payload, index }: DotItemDotProps) => {
    if (!payload.isToday) return null;
    return (
      <circle
        key={`today-${index}`}
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };
}

export function CashFlowChart({ data, periodLabel, isLoading = false }: CashFlowChartProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mode, setMode] = useState<CashFlowDisplayMode>("cumulative");
  const [hiddenSeries, setHiddenSeries] = useState<Set<CashFlowSeries>>(new Set());

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const tickColor = isDark ? "#71717a" : "#a1a1aa";
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

  function compactFormat(value: number) {
    return new Intl.NumberFormat(language, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
          {t("reports.cashFlow.title")}
        </Words>
        <span className="shrink-0 rounded-full bg-ink-100 px-3 py-1.5 dark:bg-ink-800">
          <Words
            type="xs/bold"
            as="span"
            className="flex items-center justify-center text-ink-600 dark:text-ink-300"
          >
            {periodLabel}
          </Words>
        </span>
      </div>

      <div className="flex items-center gap-1 self-start rounded-full bg-ink-100 p-1 dark:bg-ink-800">
        {DISPLAY_MODES.map((option) => {
          const isActive = mode === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition-colors",
                isActive
                  ? "bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-ink-50"
                  : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200",
              )}
            >
              <Words type={isActive ? "sm/bold" : "sm/regular"} as="span">
                {t(`reports.cashFlow.modes.${option}`)}
              </Words>
            </button>
          );
        })}
      </div>

      <div className="relative flex-1">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-16 dark:border-ink-800">
            <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
              {t("reports.cashFlow.empty")}
            </Words>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: tickColor, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{ fill: tickColor, fontSize: 12 }}
                  tickFormatter={compactFormat}
                />
                <Tooltip
                  cursor={{ stroke: gridColor }}
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${gridColor}`,
                    backgroundColor: isDark ? "#18181b" : "#ffffff",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: isDark ? "#fafafa" : "#18181b", fontWeight: 600 }}
                  formatter={(value, name) => [
                    format(Number(value)),
                    name === "income"
                      ? t("reports.cashFlow.income")
                      : t("reports.cashFlow.expense"),
                  ]}
                />
                <Legend
                  iconType="circle"
                  onClick={(entry) => toggleSeries(entry.dataKey as CashFlowSeries)}
                  formatter={(value) => {
                    const isHidden = hiddenSeries.has(value as CashFlowSeries);
                    return (
                      <span
                        className={cn(
                          "cursor-pointer select-none text-xs",
                          isHidden
                            ? "text-ink-400 line-through dark:text-ink-600"
                            : "text-ink-600 dark:text-ink-300",
                        )}
                      >
                        {value === "income"
                          ? t("reports.cashFlow.income")
                          : t("reports.cashFlow.expense")}
                      </span>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="income"
                  stroke={INCOME_COLOR}
                  strokeWidth={2.5}
                  dot={renderTodayDot(INCOME_COLOR)}
                  activeDot={{ r: 5 }}
                  animationDuration={600}
                  hide={hiddenSeries.has("income")}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="expense"
                  stroke={EXPENSE_COLOR}
                  strokeWidth={2.5}
                  dot={renderTodayDot(EXPENSE_COLOR)}
                  activeDot={{ r: 5 }}
                  animationDuration={600}
                  hide={hiddenSeries.has("expense")}
                />
              </LineChart>
            </ResponsiveContainer>
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
