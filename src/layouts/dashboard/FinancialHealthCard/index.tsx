import { useTranslation } from "react-i18next";
import { LuCircleCheck, LuCircleDashed } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { SectionHead } from "@/components/molecules/SectionHead";
import { ProgressRing } from "@/layouts/dashboard/ProgressRing";
import type {
  DashboardSummary,
  FinancialHealth,
  FinancialHealthStatus,
} from "@/types/report.types";
import { cn } from "@/utils/cn";

interface FinancialHealthCardProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

const STATUS_TONE: Record<FinancialHealthStatus, { ring: string; badge: string }> = {
  excellent: { ring: "var(--income)", badge: "bg-income-soft text-income-text" },
  good: { ring: "var(--primary)", badge: "bg-primary-soft text-primary-text" },
  fair: { ring: "var(--investment)", badge: "bg-investment-soft text-investment-text" },
  needsAttention: { ring: "var(--expense)", badge: "bg-expense-soft text-expense-text" },
};

const STATUS_LABEL_KEY: Record<FinancialHealthStatus, string> = {
  excellent: "dashboard.healthStatus.excellent",
  good: "dashboard.healthStatus.good",
  fair: "dashboard.healthStatus.fair",
  needsAttention: "dashboard.healthStatus.needsAttention",
};

const STATUS_SUBTITLE_KEY: Record<FinancialHealthStatus, string> = {
  excellent: "dashboard.healthSubtitle.excellent",
  good: "dashboard.healthSubtitle.good",
  fair: "dashboard.healthSubtitle.fair",
  needsAttention: "dashboard.healthSubtitle.needsAttention",
};

const EMPTY_FINANCIAL_HEALTH: FinancialHealth = {
  score: 0,
  status: "fair",
  savingRate: 0,
  isCashFlowPositive: false,
  isExpenseStable: false,
};

function Check({ isGood, label }: { isGood: boolean; label: string }) {
  const Icon = isGood ? LuCircleCheck : LuCircleDashed;
  return (
    <li className="flex items-center gap-2 text-[13px] text-text-2">
      <Icon
        className={cn("size-4 shrink-0", isGood ? "text-income-text" : "text-investment-text")}
      />
      <span className="truncate">{label}</span>
    </li>
  );
}

/** "Skor · Kesehatan finansial" — score ring + the three checks behind it. */
export function FinancialHealthCard({ summary, isLoading }: FinancialHealthCardProps) {
  const { t } = useTranslation();
  const health = summary?.financialHealth ?? EMPTY_FINANCIAL_HEALTH;
  const tone = STATUS_TONE[health.status];
  const isInitialLoading = isLoading && !summary;

  return (
    <Card className="flex h-full flex-col gap-4">
      <SectionHead eyebrow={t("dashboard.healthEyebrow")} title={t("dashboard.financialHealth")} />

      {isInitialLoading ? (
        <>
          <Skeleton className="mx-auto size-[150px] rounded-full" />
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3.5 w-3/5 rounded-full" />
            <Skeleton className="h-3.5 w-2/3 rounded-full" />
            <Skeleton className="h-3.5 w-1/2 rounded-full" />
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center" title={t(STATUS_SUBTITLE_KEY[health.status])}>
            <ProgressRing size={150} thickness={14} value={health.score / 100} color={tone.ring}>
              <span className="font-display text-[40px] leading-none font-semibold text-text tabular">
                {health.score}
              </span>
              <span
                className={cn(
                  "mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  tone.badge,
                )}
              >
                {t(STATUS_LABEL_KEY[health.status])}
              </span>
            </ProgressRing>
          </div>

          <ul className="flex flex-col gap-2.5">
            <Check
              isGood={health.isCashFlowPositive}
              label={t(
                health.isCashFlowPositive
                  ? "dashboard.cashFlowPositive"
                  : "dashboard.cashFlowNegative",
              )}
            />
            <Check
              isGood={health.savingRate >= 0}
              label={t("dashboard.savingRateLabel", { rate: health.savingRate })}
            />
            <Check
              isGood={health.isExpenseStable}
              label={t(
                health.isExpenseStable ? "dashboard.expenseStable" : "dashboard.expenseUnstable",
              )}
            />
          </ul>
        </>
      )}
    </Card>
  );
}
