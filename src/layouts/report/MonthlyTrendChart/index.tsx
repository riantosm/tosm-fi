import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/utils/cn";
import type { MonthlyTrendMetric, MonthlyTrendPoint } from "@/types/report.types";

const METRICS: MonthlyTrendMetric[] = ["expense", "income"];

const METRIC_COLOR: Record<MonthlyTrendMetric, string> = {
  expense: "#ef4444",
  income: "#23ac82",
};

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
  metric: MonthlyTrendMetric;
  onMetricChange: (metric: MonthlyTrendMetric) => void;
  monthsLabel: string;
}

export function MonthlyTrendChart({ data, metric, onMetricChange, monthsLabel }: MonthlyTrendChartProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const tickColor = isDark ? "#71717a" : "#a1a1aa";

  function compactFormat(value: number) {
    return new Intl.NumberFormat(language, { notation: "compact", maximumFractionDigits: 1 }).format(value);
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
          {t("reports.monthlyTrend.title")}
        </Words>
        <span className="shrink-0 rounded-full bg-ink-100 px-3 py-1.5 dark:bg-ink-800">
          <Words type="xs/bold" as="span" className="flex items-center justify-center text-ink-600 dark:text-ink-300">
            {monthsLabel}
          </Words>
        </span>
      </div>

      <div className="flex items-center gap-1 self-start rounded-full bg-ink-100 p-1 dark:bg-ink-800">
        {METRICS.map((option) => {
          const isActive = metric === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onMetricChange(option)}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition-colors",
                isActive
                  ? "bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-ink-50"
                  : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200",
              )}
            >
              <Words type={isActive ? "sm/bold" : "sm/regular"} as="span">
                {t(`reports.monthlyTrend.metrics.${option}`)}
              </Words>
            </button>
          );
        })}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={40}
              tick={{ fill: tickColor, fontSize: 12 }}
              tickFormatter={compactFormat}
            />
            <Tooltip
              cursor={{ fill: isDark ? "#27272a" : "#f4f4f5" }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${gridColor}`,
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                fontSize: 12,
              }}
              labelStyle={{ color: isDark ? "#fafafa" : "#18181b", fontWeight: 600 }}
              formatter={(value) => [format(Number(value)), t(`reports.monthlyTrend.metrics.${metric}`)]}
            />
            <Bar
              dataKey="value"
              fill={METRIC_COLOR[metric]}
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
