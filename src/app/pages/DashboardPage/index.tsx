import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { SummaryGrid } from "@/layouts/dashboard/SummaryGrid";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { useAuth } from "@/hooks/use-auth";
import { SUMMARY_STATS, RECENT_TRANSACTIONS } from "@/constants/mock-data";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
            {t("dashboard.greeting", { name: user?.name })}
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">{t("dashboard.subtitle")}</p>
        </div>

        <SummaryGrid stats={SUMMARY_STATS} />
        <TransactionList transactions={RECENT_TRANSACTIONS} />
      </div>
    </DashboardLayout>
  );
}
