import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { WalletQuickSwitcher } from "@/layouts/dashboard/WalletQuickSwitcher";
import { FinanceOverview } from "@/layouts/dashboard/FinanceOverview";
import { AddTransactionFab } from "@/layouts/dashboard/AddTransactionFab";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { MonthlySummaryCard } from "@/layouts/dashboard/MonthlySummaryCard";
import { FinancialHealthCard } from "@/layouts/dashboard/FinancialHealthCard";
import { ExpenseByCategoryChart } from "@/layouts/dashboard/ExpenseByCategoryChart";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";
import { BalanceCorrectionModal } from "@/layouts/wallet/BalanceCorrectionModal";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { formatMonthParam, startOfMonth } from "@/utils/month";
import { getGreetingKey } from "@/utils/greeting";
import type { Transaction, TransactionListResult } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

interface CorrectionState {
  wallet: WalletAccount;
  transaction: Transaction | null;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  // `transactions` is used only as a change-detection dependency below (the
  // reference changes after any create/edit/delete anywhere in the app) —
  // its contents are never rendered. Dashboard fetches its own month-scoped
  // data instead of reading the full unpaginated history.
  const { transactions, queryTransactions } = useTransactions();
  const { summary: dashboardSummary, isLoading: isDashboardSummaryLoading } = useDashboardSummary();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [correctionState, setCorrectionState] = useState<CorrectionState | null>(null);
  const [monthResult, setMonthResult] = useState<TransactionListResult | null>(null);
  const [isMonthLoading, setIsMonthLoading] = useState(true);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    let cancelled = false;
    setIsMonthLoading(true);

    void queryTransactions({ month: formatMonthParam(startOfMonth(new Date())) }).then((result) => {
      if (cancelled) return;
      setMonthResult(result);
      setIsMonthLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [queryTransactions, transactions]);

  function handleEditTransaction(transaction: Transaction) {
    if (transaction.type === "correction") {
      const wallet = wallets.find((item) => item.idWallet === transaction.idWallet);
      if (wallet) setCorrectionState({ wallet, transaction });
      return;
    }
    setEditingTransaction(transaction);
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <Words as="h1" type="xl/bold" className="text-ink-900 dark:text-ink-50">
            {t(getGreetingKey())}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("dashboard.subtitle")}
          </Words>
        </div>

        <FinanceOverview summary={dashboardSummary} isLoading={isDashboardSummaryLoading} />

        <div className="xl:flex-row flex-col flex w-full lg:items-start gap-8">
          <div className="flex flex-1 w-full flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div className="w-full sm:flex-1">
                <MonthlySummaryCard
                  summary={dashboardSummary}
                  transactionCount={monthResult?.transactions.length ?? 0}
                  isLoading={isDashboardSummaryLoading || isMonthLoading}
                />
              </div>
              <div className="w-full sm:flex-1">
                <FinancialHealthCard
                  summary={dashboardSummary}
                  isLoading={isDashboardSummaryLoading}
                />
              </div>
            </div>
            <ExpenseByCategoryChart
              summary={monthResult?.summary ?? null}
              isLoading={isMonthLoading}
            />
          </div>
          <div className="flex-1 w-full overflow-hidden space-y-4">
            <div className="w-full">
              <WalletQuickSwitcher
                onCorrectBalance={(wallet) => setCorrectionState({ wallet, transaction: null })}
              />
            </div>
            <TransactionList
              transactions={monthResult?.transactions ?? []}
              categories={categories}
              wallets={wallets}
              onEditTransaction={handleEditTransaction}
              isLoading={
                isMonthLoading || walletsStatus !== "loaded" || categoriesStatus !== "loaded"
              }
            />
          </div>
        </div>
      </div>

      <AddTransactionFab />

      <AddTransactionModal
        isOpen={editingTransaction !== null}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      <BalanceCorrectionModal
        isOpen={correctionState !== null}
        wallet={correctionState?.wallet ?? null}
        transaction={correctionState?.transaction ?? null}
        onClose={() => setCorrectionState(null)}
      />
    </DashboardLayout>
  );
}
