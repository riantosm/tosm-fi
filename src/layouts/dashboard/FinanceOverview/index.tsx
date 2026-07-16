import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  HiChevronRight,
  HiOutlineArrowDownCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowUpCircle,
  HiOutlineBanknotes,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineWallet,
} from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { illustrations } from "@/assets/images";
import { useCurrency } from "@/hooks/use-currency";
import { ROUTES } from "@/constants/routes";
import { AssetAllocationCard } from "@/layouts/dashboard/AssetAllocationCard";
import { FinancialHealthCard } from "@/layouts/dashboard/FinancialHealthCard";
import type { DashboardSummary } from "@/types/report.types";

const MASK = "••••••••";

interface FinanceOverviewProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

function NetWorthCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="h-3 w-24 rounded bg-ink-100 dark:bg-ink-800" />
      <div className="h-8 w-40 rounded bg-ink-100 dark:bg-ink-800" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-ink-100 dark:bg-ink-800" />
        <div className="h-16 rounded-xl bg-ink-100 dark:bg-ink-800" />
      </div>
    </div>
  );
}

function MonthlyCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <div className="h-7 w-7 rounded-full bg-ink-100 dark:bg-ink-800" />
      <div className="h-3 w-16 rounded bg-ink-100 dark:bg-ink-800" />
      <div className="h-4 w-20 rounded bg-ink-100 dark:bg-ink-800" />
    </div>
  );
}

export function FinanceOverview({ summary, isLoading }: FinanceOverviewProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const displayAmount = (value: number) => (isVisible ? format(value) : MASK);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="lg:flex-[1.4]">
          {isLoading || !summary ? (
            <NetWorthCardSkeleton />
          ) : (
            <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 p-5 text-white">
              <img
                src={illustrations.NetWorth}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-3 h-28 w-28 object-contain opacity-90"
              />

              <div className="relative flex items-center gap-2">
                <Words type="sm/regular" className="text-white/70">
                  {t("dashboard.totalNetWorth")}
                </Words>
                <button
                  type="button"
                  onClick={() => setIsVisible((prev) => !prev)}
                  className="text-white/60 transition-colors hover:text-white"
                  aria-label={t(isVisible ? "dashboard.hideAmount" : "dashboard.showAmount")}
                >
                  {isVisible ? <HiOutlineEye className="h-4 w-4" /> : <HiOutlineEyeSlash className="h-4 w-4" />}
                </button>
              </div>
              <Words type="2xl/bold" className="relative mt-1 text-white">
                {displayAmount(summary.wallet.totalBalance + summary.investment.totalCurrentValue)}
              </Words>

              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.WALLET)}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white/10 p-3 text-left backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <HiOutlineWallet className="h-4.5 w-4.5 text-teal-300" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <Words type="xs/regular" className="text-white/60">
                        {t("dashboard.yourMoney")}
                      </Words>
                      <Words type="sm/bold" className="truncate text-white">
                        {displayAmount(summary.wallet.totalBalance)}
                      </Words>
                      <Words type="xxs/regular" className="text-white/50">
                        {t("dashboard.walletCountLabel", { count: summary.wallet.walletCount })}
                      </Words>
                    </div>
                  </div>
                  <HiChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(ROUTES.INVESTMENT)}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white/10 p-3 text-left backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <HiOutlineArrowTrendingUp className="h-4.5 w-4.5 text-amber-300" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <Words type="xs/regular" className="text-white/60">
                        {t("dashboard.yourInvestment")}
                      </Words>
                      <Words type="sm/bold" className="truncate text-white">
                        {displayAmount(summary.investment.totalCurrentValue)}
                      </Words>
                      <Words type="xxs/regular" className="text-white/50">
                        {t("dashboard.instrumentCountLabel", { count: summary.investment.instrumentCount })}
                      </Words>
                    </div>
                  </div>
                  <HiChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:flex-1">
          <AssetAllocationCard summary={summary} isLoading={isLoading} />
        </div>

        <div className="lg:flex-1">
          <FinancialHealthCard summary={summary} isLoading={isLoading} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {t("dashboard.monthlySummaryTitle")}
        </Words>
        <div className="grid grid-cols-3 gap-3">
          {isLoading || !summary ? (
            <>
              <MonthlyCardSkeleton />
              <MonthlyCardSkeleton />
              <MonthlyCardSkeleton />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/15">
                  <HiOutlineArrowDownCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <Words type="xs/regular" className="text-ink-500 dark:text-ink-400">
                  {t("dashboard.income")}
                </Words>
                <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                  {format(summary.monthly.income)}
                </Words>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                  <HiOutlineArrowUpCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <Words type="xs/regular" className="text-ink-500 dark:text-ink-400">
                  {t("dashboard.expense")}
                </Words>
                <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                  {format(summary.monthly.expense)}
                </Words>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15">
                  <HiOutlineBanknotes className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <Words type="xs/regular" className="text-ink-500 dark:text-ink-400">
                  {t("dashboard.savings")}
                </Words>
                <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                  {format(summary.monthly.savings)}
                </Words>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
