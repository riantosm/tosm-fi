import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  HiChevronRight,
  HiOutlineArrowDownCircle,
  HiOutlineArrowUpCircle,
  HiOutlineArrowsRightLeft,
  HiOutlineChartPie,
  HiOutlineListBullet,
} from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import type { DashboardSummary } from "@/types/report.types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface MonthlySummaryCardProps {
  summary: DashboardSummary | null;
  transactionCount: number;
  isLoading: boolean;
}

function SummaryRow({
  icon,
  iconClassName,
  label,
  value,
  valueClassName,
  onClick,
}: {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  valueClassName: string;
  onClick: () => void;
}) {
  return (
    <button className="flex items-center gap-3 hover:bg-ink-800 rounded-lg p-2" onClick={onClick}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        {icon}
      </div>
      <Words type="sm/regular" className="flex-1 text-ink-600 dark:text-ink-300 text-left">
        {label}
      </Words>
      <Words type="sm/bold" className={valueClassName}>
        {value}
      </Words>
      <HiChevronRight className="h-4 w-4 shrink-0 text-ink-300 dark:text-ink-600" />
    </button>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-1 items-center gap-2 px-5 first:pl-0 last:pr-0">
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

export function MonthlySummaryCard({
  summary,
  transactionCount,
  isLoading,
}: MonthlySummaryCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const navigate = useNavigate();

  const income = summary?.monthly.income ?? 0;
  const expense = summary?.monthly.expense ?? 0;
  const savings = summary?.monthly.savings ?? 0;
  const investmentInflow = summary?.monthly.investmentInflow ?? 0;

  return (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
        {t("dashboard.monthlySummaryTitle")}
      </Words>

      <div className="relative flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <SummaryRow
            icon={
              <HiOutlineArrowDownCircle className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />
            }
            iconClassName="bg-primary-100 dark:bg-primary-500/15"
            label={t("dashboard.income")}
            value={format(income)}
            valueClassName="text-primary-600 dark:text-primary-400"
            onClick={() => navigate(ROUTES.TRANSACTIONS, { state: { typeFilter: "income" } })}
          />
          <SummaryRow
            icon={<HiOutlineArrowUpCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />}
            iconClassName="bg-red-100 dark:bg-red-500/15"
            label={t("dashboard.expense")}
            value={format(expense)}
            valueClassName="text-red-600 dark:text-red-400"
            onClick={() => navigate(ROUTES.TRANSACTIONS, { state: { typeFilter: "expense" } })}
          />
          <SummaryRow
            icon={<HiOutlineChartPie className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />}
            iconClassName="bg-amber-100 dark:bg-amber-500/15"
            label={t("nav.investment")}
            value={format(investmentInflow)}
            valueClassName="text-amber-600 dark:text-amber-400"
            onClick={() => navigate(ROUTES.INVESTMENT)}
          />
        </div>

        <div className="flex items-center rounded-xl bg-ink-50 py-2.5 dark:bg-ink-800/50 px-4">
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

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px] dark:bg-ink-950/60">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
}
