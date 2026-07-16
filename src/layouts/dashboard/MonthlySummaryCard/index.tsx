import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  HiChevronRight,
  HiOutlineArrowDownCircle,
  HiOutlineArrowUpCircle,
  HiOutlineArrowsRightLeft,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineListBullet,
} from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import type { DashboardSummary } from "@/types/report.types";

interface MonthlySummaryCardProps {
  summary: DashboardSummary | null;
  transactionCount: number;
  isLoading: boolean;
}

function CardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="h-3 w-28 rounded bg-ink-100 dark:bg-ink-800" />
      <div className="flex flex-col gap-3">
        <div className="h-11 rounded-xl bg-ink-100 dark:bg-ink-800" />
        <div className="h-11 rounded-xl bg-ink-100 dark:bg-ink-800" />
        <div className="h-11 rounded-xl bg-ink-100 dark:bg-ink-800" />
      </div>
      <div className="h-10 rounded-xl bg-ink-100 dark:bg-ink-800" />
    </div>
  );
}

function SummaryRow({
  icon,
  iconClassName,
  label,
  value,
  valueClassName,
}: {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        {icon}
      </div>
      <Words type="sm/regular" className="flex-1 text-ink-600 dark:text-ink-300">
        {label}
      </Words>
      <Words type="sm/bold" className={valueClassName}>
        {value}
      </Words>
      <HiChevronRight className="h-4 w-4 shrink-0 text-ink-300 dark:text-ink-600" />
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-1 items-center gap-2 px-3 first:pl-0 last:pr-0">
      <div className="shrink-0 text-ink-400 dark:text-ink-500">{icon}</div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Words type="xxs/regular" className="truncate text-ink-500 dark:text-ink-400">
          {label}
        </Words>
        <Words type="xs/bold" className="truncate text-ink-900 dark:text-ink-50">
          {value}
        </Words>
      </div>
    </div>
  );
}

export function MonthlySummaryCard({ summary, transactionCount, isLoading }: MonthlySummaryCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  if (isLoading || !summary) return <CardSkeleton />;

  const { income, expense, savings } = summary.monthly;
  const { savingRate } = summary.financialHealth;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
        {t("dashboard.monthlySummaryTitle")}
      </Words>

      <div className="flex flex-col gap-3">
        <SummaryRow
          icon={<HiOutlineArrowDownCircle className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />}
          iconClassName="bg-primary-100 dark:bg-primary-500/15"
          label={t("dashboard.income")}
          value={format(income)}
          valueClassName="text-primary-600 dark:text-primary-400"
        />
        <SummaryRow
          icon={<HiOutlineArrowUpCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />}
          iconClassName="bg-red-100 dark:bg-red-500/15"
          label={t("dashboard.expense")}
          value={format(expense)}
          valueClassName="text-red-600 dark:text-red-400"
        />
        <SummaryRow
          icon={<HiOutlineBanknotes className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />}
          iconClassName="bg-blue-100 dark:bg-blue-500/15"
          label={t("dashboard.savings")}
          value={format(savings)}
          valueClassName="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="flex items-center rounded-xl bg-ink-50 py-2.5 dark:bg-ink-800/50">
        <StatItem
          icon={<HiOutlineClock className="h-4 w-4" />}
          label={t("dashboard.savingRate")}
          value={`${savingRate}%`}
        />
        <div className="h-8 w-px shrink-0 bg-ink-200 dark:bg-ink-800" />
        <StatItem
          icon={<HiOutlineArrowsRightLeft className="h-4 w-4" />}
          label={t("dashboard.difference")}
          value={format(savings)}
        />
        <div className="h-8 w-px shrink-0 bg-ink-200 dark:bg-ink-800" />
        <StatItem
          icon={<HiOutlineListBullet className="h-4 w-4" />}
          label={t("dashboard.totalTransactions")}
          value={String(transactionCount)}
        />
      </div>
    </div>
  );
}
