import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/utils/cn";
import type { TimelinePoint } from "@/utils/investment-timeline";

interface InstrumentHistoryChartProps {
  data: TimelinePoint[];
  color: string;
}

export function InstrumentHistoryChart({ data, color }: InstrumentHistoryChartProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const tickColor = isDark ? "#71717a" : "#a1a1aa";
  const investedColor = isDark ? "#71717a" : "#a1a1aa";

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
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="instrumentCurrentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
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
            formatter={(value, name) => [
              format(Number(value)),
              name === "invested" ? t("investment.investedAmount") : t("investment.currentValue"),
            ]}
          />
          <Legend
            iconType="circle"
            formatter={(value) => (
              <span className={cn("text-xs", "text-ink-600 dark:text-ink-300")}>
                {value === "invested"
                  ? t("investment.investedAmount")
                  : t("investment.currentValue")}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="invested"
            name="invested"
            stroke={investedColor}
            strokeWidth={2}
            fill="none"
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="current"
            name="current"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#instrumentCurrentFill)"
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
