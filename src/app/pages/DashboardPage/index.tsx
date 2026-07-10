import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { SummaryGrid } from "@/layouts/dashboard/SummaryGrid";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { WalletQuickSwitcher } from "@/layouts/dashboard/WalletQuickSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { SUMMARY_STATS, RECENT_TRANSACTIONS } from "@/constants/mock-data";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <Words as="h1" type="xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("dashboard.greeting", { name: user?.name })}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("dashboard.subtitle")}
          </Words>
        </div>

        <WalletQuickSwitcher />
        <SummaryGrid stats={SUMMARY_STATS} />
        <TransactionList transactions={RECENT_TRANSACTIONS} />
      </div>
    </DashboardLayout>
  );
}
