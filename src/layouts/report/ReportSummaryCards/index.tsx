import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import {
  LuArrowDown,
  LuArrowDownLeft,
  LuArrowUp,
  LuArrowUpRight,
  LuMinus,
  LuReceiptText,
  LuScale,
} from "react-icons/lu";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";
import type { ReportMetricDelta, ReportSummary } from "@/types/report.types";

/** Whether a rise in the metric is good news (green), bad news (red) or neither. */
type Polarity = "up-good" | "up-bad" | "neutral";
type DeltaTone = "good" | "bad" | "neutral";

interface CardConfig {
  key: keyof ReportSummary;
  icon: IconType;
  tileClass: string;
  labelKey: string;
  polarity: Polarity;
  isMoney: boolean;
}

const CARD_CONFIGS: CardConfig[] = [
  {
    key: "totalIncome",
    icon: LuArrowDownLeft,
    tileClass: "bg-income-soft text-income-text",
    labelKey: "reports.summary.totalIncome",
    polarity: "up-good",
    isMoney: true,
  },
  {
    key: "totalExpense",
    icon: LuArrowUpRight,
    tileClass: "bg-expense-soft text-expense-text",
    labelKey: "reports.summary.totalExpense",
    polarity: "up-bad",
    isMoney: true,
  },
  {
    key: "netCashFlow",
    icon: LuScale,
    tileClass: "bg-primary-soft text-primary-text",
    labelKey: "reports.summary.netCashFlow",
    polarity: "up-good",
    isMoney: true,
  },
  {
    key: "transactionCount",
    icon: LuReceiptText,
    tileClass: "bg-investment-soft text-investment-text",
    labelKey: "reports.summary.transactionCount",
    polarity: "neutral",
    isMoney: false,
  },
];

const DELTA_CLASS: Record<DeltaTone, string> = {
  good: "bg-income-soft text-income-text",
  bad: "bg-expense-soft text-expense-text",
  neutral: "bg-surface-2 text-text-2",
};

function resolveDeltaTone(changePercent: number, polarity: Polarity): DeltaTone {
  if (changePercent === 0 || polarity === "neutral") return "neutral";
  const isUp = changePercent > 0;
  return isUp === (polarity === "up-good") ? "good" : "bad";
}

function DeltaChip({ delta, polarity }: { delta: ReportMetricDelta; polarity: Polarity }) {
  const { language } = useLanguage();
  const tone = resolveDeltaTone(delta.changePercent, polarity);
  const Icon =
    delta.changePercent > 0 ? LuArrowUp : delta.changePercent < 0 ? LuArrowDown : LuMinus;
  const percent = new Intl.NumberFormat(toIntlLocale(language), {
    maximumFractionDigits: 1,
  }).format(Math.abs(delta.changePercent));

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-[3px] rounded-full px-2 py-0.5 text-[11px] font-semibold tabular sm:text-[11.5px]",
        DELTA_CLASS[tone],
      )}
    >
      <Icon className="size-2.5 sm:size-[11px]" />
      {percent}%
    </span>
  );
}

interface ReportSummaryCardsProps {
  summary: ReportSummary | null;
  previousLabel: string;
  /** Shows skeleton values while the summary for the current period is being fetched. */
  isLoading?: boolean;
}

export function ReportSummaryCards({
  summary,
  previousLabel,
  isLoading = false,
}: ReportSummaryCardsProps) {
  const { t } = useTranslation();
  const { symbol, formatNumber, formatCompact } = useMoneyFormat();
  const showSkeleton = !summary || isLoading;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {CARD_CONFIGS.map((config, index) => {
        const delta = summary?.[config.key];
        const Icon = config.icon;

        return (
          <Reveal key={config.key} delay={index * 0.05}>
            <Card
              padding="none"
              className="flex h-full min-w-0 flex-col gap-2 p-3.5 sm:gap-3 sm:p-5 lg:p-6"
            >
              <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                <span
                  className={cn(
                    "flex size-[26px] shrink-0 items-center justify-center rounded-[8px] sm:size-8 sm:rounded-[10px]",
                    config.tileClass,
                  )}
                >
                  <Icon className="size-[13px] sm:size-[15px]" />
                </span>
                <span className="min-w-0 truncate text-[12px] text-text-2 sm:text-[13px]">
                  {t(config.labelKey)}
                </span>
              </div>

              {showSkeleton || !delta ? (
                <div className="flex flex-col gap-2.5 py-0.5">
                  <Skeleton className="h-5 w-3/4 rounded-[8px] sm:h-[26px] sm:w-[150px]" />
                  <Skeleton className="h-3 w-1/2 rounded-[6px] sm:w-[190px] sm:max-w-full" />
                </div>
              ) : (
                <div
                  key={`${config.key}-${delta.value}`}
                  className="flex animate-fade-in flex-col gap-2 sm:gap-3"
                >
                  {/* Phone: compact number ("18,5 jt"); sm+: symbol + full number. */}
                  <p className="truncate font-num text-[20px] leading-none font-semibold text-text tabular sm:hidden">
                    {config.isMoney ? formatCompact(delta.value) : Math.round(delta.value)}
                  </p>
                  <p className="hidden min-w-0 items-end gap-1.5 sm:flex">
                    {config.isMoney && (
                      <span className="shrink-0 font-display text-[13px] text-text-3">
                        {symbol}
                      </span>
                    )}
                    <span className="truncate font-num text-[24px] leading-none font-semibold tracking-[-0.02em] text-text tabular lg:text-[26px]">
                      {config.isMoney ? formatNumber(delta.value) : Math.round(delta.value)}
                    </span>
                  </p>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <DeltaChip delta={delta} polarity={config.polarity} />
                    <span className="hidden truncate text-[11.5px] text-text-3 sm:inline">
                      {previousLabel}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </Reveal>
        );
      })}
    </div>
  );
}
