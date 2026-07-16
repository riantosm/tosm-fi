import { useTranslation } from "react-i18next";
import { HiCheckCircle, HiOutlineExclamationCircle, HiOutlineShieldCheck } from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { cn } from "@/utils/cn";
import type { DashboardSummary, FinancialHealth, FinancialHealthStatus } from "@/types/report.types";

interface FinancialHealthCardProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

const STATUS_COLOR: Record<FinancialHealthStatus, string> = {
  excellent: "#10B981",
  good: "#34D399",
  fair: "#F59E0B",
  needsAttention: "#EF4444",
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

const GAUGE_SIZE = 76;
const GAUGE_THICKNESS = 8;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_THICKNESS) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const offset = GAUGE_CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="relative shrink-0" style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
      <svg width={GAUGE_SIZE} height={GAUGE_SIZE} className="-rotate-90">
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_RADIUS}
          strokeWidth={GAUGE_THICKNESS}
          className="fill-none stroke-ink-100 dark:stroke-ink-800"
        />
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_RADIUS}
          strokeWidth={GAUGE_THICKNESS}
          strokeLinecap="round"
          fill="none"
          stroke={color}
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <Words type="lg/bold" style={{ color }}>
          {score}
        </Words>
        <Words type="xxs/regular" className="text-ink-400 dark:text-ink-500">
          /100
        </Words>
      </div>
    </div>
  );
}

function ChecklistItem({ isGood, label }: { isGood: boolean; label: string }) {
  const Icon = isGood ? HiCheckCircle : HiOutlineExclamationCircle;
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn("h-4 w-4 shrink-0", isGood ? "text-emerald-500" : "text-amber-500")} />
      <Words type="xs/regular" className="text-ink-600 dark:text-ink-300">
        {label}
      </Words>
    </div>
  );
}

const EMPTY_FINANCIAL_HEALTH: FinancialHealth = {
  score: 0,
  status: "fair",
  savingRate: 0,
  isCashFlowPositive: false,
  isExpenseStable: false,
};

export function FinancialHealthCard({ summary, isLoading }: FinancialHealthCardProps) {
  const { t } = useTranslation();

  const financialHealth = summary?.financialHealth ?? EMPTY_FINANCIAL_HEALTH;
  const color = STATUS_COLOR[financialHealth.status];

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between">
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {t("dashboard.financialHealth")}
        </Words>
        <HiOutlineShieldCheck className="h-5 w-5 text-emerald-500" />
      </div>

      <div className="relative flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-4">
          <ScoreGauge score={financialHealth.score} color={color} />
          <div className="flex flex-col gap-0.5">
            <Words type="sm/bold" style={{ color }}>
              {t(STATUS_LABEL_KEY[financialHealth.status])}
            </Words>
            <Words type="xxs/regular" className="text-ink-500 dark:text-ink-400">
              {t(STATUS_SUBTITLE_KEY[financialHealth.status])}
            </Words>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <ChecklistItem
            isGood={financialHealth.isCashFlowPositive}
            label={t(
              financialHealth.isCashFlowPositive
                ? "dashboard.cashFlowPositive"
                : "dashboard.cashFlowNegative",
            )}
          />
          <ChecklistItem
            isGood={financialHealth.savingRate >= 0}
            label={t("dashboard.savingRateLabel", { rate: financialHealth.savingRate })}
          />
          <ChecklistItem
            isGood={financialHealth.isExpenseStable}
            label={t(financialHealth.isExpenseStable ? "dashboard.expenseStable" : "dashboard.expenseUnstable")}
          />
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px] dark:bg-ink-950/60">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
}
