import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { WalletQuickSwitcher } from "@/layouts/dashboard/WalletQuickSwitcher";
import { AddTransactionFab } from "@/layouts/dashboard/AddTransactionFab";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { ExpenseByCategoryChart } from "@/layouts/dashboard/ExpenseByCategoryChart";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";
import { BalanceCorrectionModal } from "@/layouts/wallet/BalanceCorrectionModal";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { isSameMonthAs, startOfMonth } from "@/utils/month";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

interface CorrectionState {
  wallet: WalletAccount;
  transaction: Transaction | null;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { transactions, status: transactionsStatus, loadTransactions } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [correctionState, setCorrectionState] = useState<CorrectionState | null>(null);

  const currentMonthTransactions = useMemo(() => {
    const currentMonth = startOfMonth(new Date());
    return transactions.filter((transaction) =>
      isSameMonthAs(new Date(transaction.date), currentMonth),
    );
  }, [transactions]);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    if (transactionsStatus === "idle") void loadTransactions();
  }, [transactionsStatus, loadTransactions]);

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
            {t("dashboard.greeting", { name: user?.nameUser })}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("dashboard.subtitle")}
          </Words>
        </div>

        <WalletQuickSwitcher
          onCorrectBalance={(wallet) => setCorrectionState({ wallet, transaction: null })}
        />

        <div className="lg:flex lg:items-start space-x-8 space-y-8">
          <div className="flex-1">
            <ExpenseByCategoryChart transactions={transactions} categories={categories} />
          </div>
          <div className="flex-1">
            <TransactionList
              transactions={currentMonthTransactions}
              categories={categories}
              wallets={wallets}
              onEditTransaction={handleEditTransaction}
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
