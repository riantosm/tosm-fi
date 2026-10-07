import { useTranslation } from "react-i18next";
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
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { ChartTooltip } from "@/components/molecules/ChartTooltip";
import { MoneyAmount } from "@/layouts/investment/MoneyAmount";
import { ProfitLossPill } from "@/layouts/investment/ProfitLossPill";
import { cn } from "@/utils/cn";
import type { InvestmentTotals } from "@/utils/investment";
import type { NetWorthPeriodPreset } from "@/utils/net-worth-period";
import type {
  NetWorthTimelineGranularity,
  NetWorthTimelinePoint,
} from "@/types/investment-transaction.types";

const GRANULARITIES: NetWorthTimelineGranularity[] = ["day", "month", "year"];
const PERIODS: NetWorthPeriodPreset[] = ["month", "year", "all"];
const GRADIENT_ID = "investment-hero-fill";

interface NetWorthChartProps {
  data: NetWorthTimelinePoint[];
  /** Totals of the (filtered) portfolio — value, capital and P/L. */
  totals: InvestmentTotals;
  granularity: NetWorthTimelineGranularity;
  onGranularityChange: (granularity: NetWorthTimelineGranularity) => void;
  period: NetWorthPeriodPreset;
  onPeriodChange: (period: NetWorthPeriodPreset) => void;
  isLoading?: boolean;
}

const HERO_CLASS =
  "relative overflow-hidden rounded-[24px] bg-gradient-to-br from-hero-bg to-hero-bg-2 p-5 text-hero-fg lg:rounded-[28px] lg:p-7";

function HeroValue({ value }: { value: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[12.5px] text-hero-fg-2 lg:text-[14px]">
        {t("investment.totalValue")}
      </span>
      <MoneyAmount
        value={value}
        className="gap-2 lg:gap-2.5"
        symbolClassName="text-[15px] font-medium text-hero-fg-2 lg:text-[20px]"
        numberClassName="text-[34px] leading-[1.1] tracking-[-0.025em] text-hero-fg lg:text-[48px]"
      />
    </div>
  );
}

/** Investment hero: total value, P/L vs capital, granularity/period toggles and the value chart. */
export function NetWorthChart({
  data,
  totals,
  granularity,
  onGranularityChange,
  period,
  onPeriodChange,
  isLoading = false,
}: NetWorthChartProps) {
  const { t } = useTranslation();
  const { format, formatCompact } = useMoneyFormat();
  const lastIndex = data.length - 1;

  function renderEndDot({ cx, cy, index }: DotItemDotProps) {
    if (index !== lastIndex || cx == null || cy == null) return null;
    return (
      <circle
        key="end"
        cx={cx}
        cy={cy}
        r={7}
        fill="var(--investment)"
        stroke="var(--surface)"
        strokeWidth={3}
      />
    );
  }

  const periodOptions = PERIODS.map((option) => ({
    value: option,
    label: t(`investment.netWorth.period.${option}`),
  }));

  return (
    <section className={HERO_CLASS}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2.5">
          <HeroValue value={totals.currentValue} />
          <div className="flex flex-wrap items-center gap-2">
            <ProfitLossPill
              profitLoss={totals.profitLoss}
              percent={totals.profitLossPercent}
              showAmount
              onSurface
              className="lg:text-[12.5px]"
            />
            <span className="text-[12px] text-hero-fg-2 lg:hidden">
              {t("investment.capitalShort", { amount: formatCompact(totals.investedAmount) })}
            </span>
            <span className="hidden text-[13px] text-hero-fg-2 lg:inline">
              {t("investment.fromCapital", { amount: format(totals.investedAmount) })}
            </span>
          </div>
        </div>

        <div className="hidden flex-col items-end gap-2 lg:flex">
          <SegmentedControl
            options={GRANULARITIES.map((option) => ({
              value: option,
              label: t(`investment.netWorth.granularity.${option}`),
            }))}
            value={granularity}
            onChange={onGranularityChange}
            className="bg-surface/60"
          />
          <SegmentedControl
            options={periodOptions}
            value={period}
            onChange={onPeriodChange}
            className="bg-surface/60"
          />
        </div>
        <SegmentedControl
          options={periodOptions}
          value={period}
          onChange={onPeriodChange}
          fill
          className="bg-surface/60 lg:hidden"
        />
      </div>

      <div className="relative mt-4 h-[140px] sm:h-[180px] lg:mt-5 lg:h-[210px]">
        {data.length === 0 && !isLoading ? (
          <div className="flex h-full items-center justify-center text-center text-[13px] text-hero-fg-2">
            {t("investment.emptyChartHint")}
          </div>
        ) : (
          <div className={cn("h-full transition-opacity duration-300", isLoading && "opacity-40")}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 12, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--investment)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--investment)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--hero-fg-2)" strokeOpacity={0.14} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  minTickGap={18}
                  tick={{ fill: "var(--hero-fg-2)", fontSize: 11 }}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  cursor={{ stroke: "var(--investment)", strokeOpacity: 0.6 }}
                  content={({ active, payload, label }) => {
                    const point = payload?.[0]?.payload as NetWorthTimelinePoint | undefined;
                    if (!active || !point) return null;
                    return (
                      <ChartTooltip
                        title={label}
                        rows={[
                          {
                            key: "current",
                            label: t("investment.currentValue"),
                            value: format(point.current),
                            color: "var(--investment)",
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
                  dataKey="current"
                  stroke="var(--investment)"
                  strokeWidth={2.5}
                  fill={`url(#${GRADIENT_ID})`}
                  dot={renderEndDot}
                  activeDot={{
                    r: 7,
                    fill: "var(--investment)",
                    stroke: "var(--surface)",
                    strokeWidth: 3,
                  }}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconLoader className="size-5 animate-spin text-hero-fg-2" />
          </div>
        )}
      </div>
    </section>
  );
}

/** Hero shown before any instrument exists (Investasi · Kosong). */
export function NetWorthHeroEmpty() {
  const { t } = useTranslation();
  return (
    <section className={HERO_CLASS}>
      <div className="flex flex-col gap-2">
        <HeroValue value={0} />
        <p className="text-[12.5px] text-hero-fg-2 lg:text-[13px]">
          {t("investment.emptyChartHint")}
        </p>
      </div>
    </section>
  );
}
