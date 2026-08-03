import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { getInstrumentTotals } from "@/utils/investment";
import type { Instrument } from "@/types/instrument.types";
import type { TimelinePoint } from "@/types/investment-transaction.types";
import { cn } from "@/utils/cn";

interface InstrumentCardProps {
  instrument: Instrument;
  sparkline: TimelinePoint[];
  isSelected: boolean;
  onClick: () => void;
  /** "carousel" (default): fixed width for a horizontal scroll row. "grid": fills its grid cell. */
  layout?: "carousel" | "grid";
}

export function InstrumentCard({
  instrument,
  sparkline,
  isSelected,
  onClick,
  layout = "carousel",
}: InstrumentCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  const totals = useMemo(() => getInstrumentTotals(instrument), [instrument]);
  const isPositive = totals.profitLoss >= 0;
  const gradientId = `instrument-spark-${instrument.idInstrument}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all duration-300 ease-in-out dark:bg-ink-900",
        layout === "grid" ? "w-full" : "w-56 shrink-0",
        isSelected ? "" : "border-ink-200 hover:border-ink-300 dark:border-ink-800 dark:hover:border-ink-700",
      )}
      style={isSelected ? { borderColor: instrument.color } : undefined}
    >
      <div className="relative z-10 flex flex-col gap-1.5">
        <Words type="sm/bold" className="truncate" style={{ color: instrument.color }}>
          {instrument.nameInstrument}
        </Words>
        <Words type="lg/bold" className="truncate text-ink-900 dark:text-ink-50">
          {format(totals.currentValue)}
        </Words>
        <div className="flex items-center justify-between gap-2">
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {t("investment.accountsCount", {
              n: instrument.investmentAccounts.filter((account) => !account.isDeleted).length,
            })}
          </Words>
          <Words
            type="xs/bold"
            as="span"
            className={
              isPositive
                ? "text-primary-600 dark:text-primary-400"
                : "text-red-500 dark:text-red-400"
            }
          >
            {isPositive ? "↑" : "↓"} {Math.abs(totals.profitLossPercent).toFixed(2)}%
          </Words>
        </div>
      </div>

      {sparkline.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={instrument.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={instrument.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="current"
                stroke={instrument.color}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </button>
  );
}
