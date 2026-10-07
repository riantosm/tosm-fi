import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/molecules/ChartTooltip";
import { formatTimelineDate } from "@/layouts/investment/investment-ui";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import type {
  NetWorthTimelineGranularity,
  TimelinePoint,
} from "@/types/investment-transaction.types";

interface InstrumentHistoryChartProps {
  /** Already summed + bucketed running totals. */
  data: TimelinePoint[];
  color: string;
  granularity: NetWorthTimelineGranularity;
  className?: string;
}

/** "Riwayat nilai": value area in the instrument color over a dimmed gray capital area. */
export function InstrumentHistoryChart({
  data,
  color,
  granularity,
  className,
}: InstrumentHistoryChartProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useMoneyFormat();
  const gradientId = `history-${useId().replace(/:/g, "")}`;
  const capitalGradientId = `${gradientId}-capital`;

  return (
    <div className={cn("h-[150px] w-full lg:h-[230px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={capitalGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--text-3)", stopOpacity: 0.18 }} />
              <stop offset="100%" style={{ stopColor: "var(--text-3)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            minTickGap={22}
            tick={{ fill: "var(--text-3)", fontSize: 11.5 }}
            tickFormatter={(value: string) => formatTimelineDate(value, granularity, language)}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            cursor={{ stroke: color, strokeOpacity: 0.5 }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as TimelinePoint | undefined;
              if (!active || !point) return null;
              return (
                <ChartTooltip
                  title={formatTimelineDate(point.date, granularity, language, "tooltip")}
                  rows={[
                    {
                      key: "current",
                      label: t("investment.valueShort"),
                      value: format(point.current),
                      color,
                    },
                    {
                      key: "invested",
                      label: t("investment.capital"),
                      value: format(point.invested),
                      color: "var(--text-3)",
                      marker: "line",
                      muted: true,
                    },
                  ]}
                />
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="var(--text-3)"
            strokeOpacity={0.55}
            strokeWidth={1.75}
            fill={`url(#${capitalGradientId})`}
            dot={false}
            activeDot={false}
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 6, fill: color, stroke: "var(--surface)", strokeWidth: 3 }}
            animationDuration={600}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
