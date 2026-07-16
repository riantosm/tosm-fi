import { useTranslation } from "react-i18next";
import { DonutChart } from "@/components/molecules/DonutChart";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import type { DashboardSummary } from "@/types/report.types";

interface AssetAllocationCardProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

const INVESTMENT_COLOR = "#F59E0B";
const CASH_COLOR = "#2DD4BF";

export function AssetAllocationCard({ summary, isLoading }: AssetAllocationCardProps) {
  const { t } = useTranslation();

  const investmentValue = summary?.investment.totalCurrentValue ?? 0;
  const cashValue = summary?.wallet.totalBalance ?? 0;
  const total = investmentValue + cashValue;

  const investmentPercent = total > 0 ? Math.round((investmentValue / total) * 100) : 0;
  const cashPercent = total > 0 ? 100 - investmentPercent : 0;

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
        {t("dashboard.assetAllocation")}
      </Words>

      <div className="relative flex flex-1 items-center justify-center">
        {total <= 0 ? (
          <div className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-6 dark:border-ink-800">
            <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
              {t("dashboard.noAllocationData")}
            </Words>
          </div>
        ) : (
          <div className="relative">
            <DonutChart
              data={[
                { id: "investment", label: t("nav.investment"), value: investmentValue, color: INVESTMENT_COLOR },
                { id: "cash", label: t("dashboard.cash"), value: cashValue, color: CASH_COLOR },
              ]}
              size={168}
              thickness={16}
              disableCenterOverlay
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-3 text-center">
              <Words type="sm/bold" style={{ color: INVESTMENT_COLOR }}>
                {t("nav.investment")} {investmentPercent}%
              </Words>
              <Words type="sm/bold" style={{ color: CASH_COLOR }}>
                {t("dashboard.cash")} {cashPercent}%
              </Words>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px] dark:bg-ink-950/60">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
}
