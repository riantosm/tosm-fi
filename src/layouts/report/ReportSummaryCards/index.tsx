import { createElement } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineRectangleStack,
  HiOutlineScale,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/utils/cn";
import type { ReportMetricDelta, ReportSummary } from "@/types/report.types";

interface CardConfig {
  key: keyof ReportSummary;
  icon: IconType;
  iconBg: string;
  iconColor: string;
  labelKey: string;
  formatValue: (value: number, format: (n: number) => string) => string;
}

const CARD_CONFIGS: CardConfig[] = [
  {
    key: "totalIncome",
    icon: HiOutlineBanknotes,
    iconBg: "bg-primary-100 dark:bg-primary-500/15",
    iconColor: "text-primary-600 dark:text-primary-400",
    labelKey: "reports.summary.totalIncome",
    formatValue: (value, format) => format(value),
  },
  {
    key: "totalExpense",
    icon: HiOutlineCreditCard,
    iconBg: "bg-red-100 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
    labelKey: "reports.summary.totalExpense",
    formatValue: (value, format) => format(value),
  },
  {
    key: "netCashFlow",
    icon: HiOutlineScale,
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    labelKey: "reports.summary.netCashFlow",
    formatValue: (value, format) => format(value),
  },
  {
    key: "transactionCount",
    icon: HiOutlineRectangleStack,
    iconBg: "bg-amber-100 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    labelKey: "reports.summary.transactionCount",
    formatValue: (value) => String(Math.round(value)),
  },
];

function DeltaBadge({ delta, previousLabel }: { delta: ReportMetricDelta; previousLabel: string }) {
  const isPositive = delta.changePercent >= 0;
  const Icon = isPositive ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown;

  return (
    <div className="flex items-center gap-1">
      <Icon
        className={cn("h-3.5 w-3.5 shrink-0", isPositive ? "text-primary-600 dark:text-primary-400" : "text-red-500 dark:text-red-400")}
      />
      <Words
        type="xs/bold"
        as="span"
        className={isPositive ? "text-primary-600 dark:text-primary-400" : "text-red-500 dark:text-red-400"}
      >
        {Math.abs(delta.changePercent).toFixed(0)}%
      </Words>
      <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
        {previousLabel}
      </Words>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="h-9 w-9 rounded-xl bg-ink-100 dark:bg-ink-800" />
      <div className="h-3 w-20 rounded bg-ink-100 dark:bg-ink-800" />
      <div className="h-5 w-28 rounded bg-ink-100 dark:bg-ink-800" />
    </div>
  );
}

interface ReportSummaryCardsProps {
  summary: ReportSummary | null;
  previousLabel: string;
}

export function ReportSummaryCards({ summary, previousLabel }: ReportSummaryCardsProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {!summary
        ? Array.from({ length: 4 }, (_, index) => <SummaryCardSkeleton key={index} />)
        : CARD_CONFIGS.map((config) => {
            const delta = summary[config.key];
            return (
              <div
                key={config.key}
                className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
              >
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", config.iconBg)}>
                  {createElement(config.icon, { className: cn("h-4.5 w-4.5", config.iconColor) })}
                </div>
                <Words type="xs/regular" className="text-ink-500 dark:text-ink-400">
                  {t(config.labelKey)}
                </Words>
                <Words type="lg/bold" className="text-ink-900 dark:text-ink-50">
                  {config.formatValue(delta.value, format)}
                </Words>
                <DeltaBadge delta={delta} previousLabel={previousLabel} />
              </div>
            );
          })}
    </div>
  );
}
