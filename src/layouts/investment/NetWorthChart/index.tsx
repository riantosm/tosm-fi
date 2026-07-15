import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import type { TimelinePoint } from "@/utils/investment-timeline";

interface NetWorthChartProps {
  data: TimelinePoint[];
  total: number;
  isLoading?: boolean;
}

export function NetWorthChart({ data, total, isLoading = false }: NetWorthChartProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const tickColor = isDark ? "#71717a" : "#a1a1aa";

  function compactFormat(value: number) {
    return new Intl.NumberFormat(language, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  function dateFormat(value: string) {
    return new Intl.DateTimeFormat(language, { day: "numeric", month: "short" }).format(
      new Date(value),
    );
  }

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#23ac82" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#23ac82" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={dateFormat}
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={44}
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
              labelFormatter={(value) => dateFormat(String(value))}
              labelStyle={{ color: isDark ? "#fafafa" : "#18181b", fontWeight: 600 }}
              formatter={(value) => [format(Number(value)), t("investment.currentValue")]}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#23ac82"
              strokeWidth={2.5}
              fill="url(#netWorthFill)"
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <Words
          type="xs/bold"
          className="uppercase tracking-wide text-ink-400 dark:text-ink-500"
        >
          {t("investment.totalValue")}
        </Words>
        <Words type="3xl/bold" className="text-ink-900 dark:text-ink-50">
          {format(total)}
        </Words>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-12 backdrop-blur-[2px] dark:bg-ink-950/60">
          <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      )}
    </div>
  );
}
