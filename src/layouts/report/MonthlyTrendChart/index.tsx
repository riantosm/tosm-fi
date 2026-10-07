import { useTranslation } from "react-i18next";
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BarShapeProps } from "recharts";
import { Card } from "@/components/molecules/Card";
import { ChartTooltip } from "@/components/molecules/ChartTooltip";
import { SectionHead } from "@/components/molecules/SectionHead";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import type { MonthlyTrendMetric, MonthlyTrendPoint } from "@/types/report.types";

const METRICS: MonthlyTrendMetric[] = ["expense", "income"];

/** Past months are the soft tint; the current (last) month is the solid color. */
const METRIC_COLOR: Record<MonthlyTrendMetric, { solid: string; soft: string; text: string }> = {
  expense: { solid: "var(--expense)", soft: "var(--expense-soft)", text: "text-expense-text" },
  income: { solid: "var(--income)", soft: "var(--income-soft)", text: "text-income-text" },
};

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
  metric: MonthlyTrendMetric;
  onMetricChange: (metric: MonthlyTrendMetric) => void;
  /** "LAPORAN · 12 BULAN" */
  eyebrow: string;
  isLoading?: boolean;
  className?: string;
}

export function MonthlyTrendChart({
  data,
  metric,
  onMetricChange,
  eyebrow,
  isLoading = false,
  className,
}: MonthlyTrendChartProps) {
  const { t } = useTranslation();
  const { format, formatCompact } = useMoneyFormat();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const lastIndex = data.length - 1;
  const colors = METRIC_COLOR[metric];

  const metricControl = (fill: boolean) => (
    <SegmentedControl
      options={METRICS.map((option) => ({
        value: option,
        label: t(`reports.monthlyTrend.metrics.${option}`),
      }))}
      value={metric}
      onChange={onMetricChange}
      fill={fill}
      activeClassName={colors.text}
      ariaLabel={t("reports.monthlyTrend.title")}
    />
  );

  /**
   * Bar shape: soft tint for past months, solid for the current (last) one
   * with a dark value pill floating above it.
   */
  function renderBar(props: BarShapeProps) {
    const { x, y, width, height, index } = props as BarShapeProps & { index: number };
    const isCurrent = index === lastIndex;
    const barX = Number(x);
    const barY = Number(y);
    const barWidth = Number(width);
    const text = isCurrent ? formatCompact(Number(data[index]?.value ?? 0)) : "";
    const pillWidth = Math.max(34, text.length * 6.6 + 14);
    const cx = barX + barWidth / 2;
    return (
      <g>
        <Rectangle
          x={barX}
          y={barY}
          width={barWidth}
          height={Number(height)}
          radius={[12, 12, 4, 4]}
          fill={isCurrent ? colors.solid : colors.soft}
        />
        {isCurrent && (
          <g>
            <rect
              x={cx - pillWidth / 2}
              y={barY - 26}
              width={pillWidth}
              height={19}
              rx={9.5}
              fill="var(--text)"
            />
            <text
              x={cx}
              y={barY - 13}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={600}
              fill="var(--surface)"
            >
              {text}
            </text>
          </g>
        )}
      </g>
    );
  }

  return (
    <Card className={cn("flex flex-col gap-4 lg:gap-[18px]", className)}>
      <SectionHead
        eyebrow={eyebrow}
        title={t("reports.monthlyTrend.title")}
        right={<div className="hidden lg:block">{metricControl(false)}</div>}
      />

      <div
        className={cn(
          "h-[190px] w-full transition-opacity duration-300 lg:h-[330px] [&_*]:outline-none",
          isLoading && "opacity-50",
        )}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 30, right: 16, left: 4, bottom: 0 }}
            barCategoryGap="12%"
          >
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              tickMargin={10}
              tick={(tickProps) => {
                const { x, y, payload } = tickProps as unknown as {
                  x: number;
                  y: number;
                  payload: { value: string; index: number };
                };
                const isCurrent = payload.index === lastIndex;
                return (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize={isDesktop ? 11.5 : 11}
                    fontWeight={isCurrent ? 700 : 400}
                    fill={isCurrent ? "var(--text)" : "var(--text-3)"}
                  >
                    {isDesktop ? payload.value : payload.value.charAt(0)}
                  </text>
                );
              }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "var(--surface-2)", radius: 12 }}
              content={({ active, payload, label }) => {
                const point = payload?.[0]?.payload as MonthlyTrendPoint | undefined;
                if (!active || !point) return null;
                return (
                  <ChartTooltip
                    title={label}
                    rows={[
                      {
                        key: metric,
                        label: t(`reports.monthlyTrend.metrics.${metric}`),
                        value: format(point.value),
                        color: colors.solid,
                      },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="value" shape={renderBar} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:hidden">{metricControl(true)}</div>
    </Card>
  );
}
