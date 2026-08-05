import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { IconLoader } from "@/components/atoms/IconLoader";
import { WalletQuickSwitcher } from "@/layouts/dashboard/WalletQuickSwitcher";
import { FinanceOverview } from "@/layouts/dashboard/FinanceOverview";
import { AddTransactionFab } from "@/layouts/dashboard/AddTransactionFab";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { MonthlySummaryCard } from "@/layouts/dashboard/MonthlySummaryCard";
import { FinancialHealthCard } from "@/layouts/dashboard/FinancialHealthCard";
import { ExpenseByCategoryChart } from "@/layouts/dashboard/ExpenseByCategoryChart";
import { BudgetsSummary } from "@/layouts/dashboard/BudgetsSummary";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";
import { BalanceCorrectionModal } from "@/layouts/wallet/BalanceCorrectionModal";
import { PayOccurrenceModal } from "@/layouts/schedule/PayOccurrenceModal";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useBudgetSpending } from "@/hooks/use-budget-spending";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { useScheduleOccurrences } from "@/hooks/use-schedule-occurrences";
import { useScheduleOccurrenceActions } from "@/hooks/use-schedule-occurrence-actions";
import { formatMonthParam, startOfMonth } from "@/utils/month";
import { filterOccurrencesForView } from "@/utils/schedule-occurrence-filter";
import { getGreetingKey } from "@/utils/greeting";
import { ROUTES } from "@/constants/routes";
import type { Transaction, TransactionSummary } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

const MONTH_LIST_PAGE_SIZE = 10;

interface CorrectionState {
  wallet: WalletAccount;
  transaction: Transaction | null;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  // `transactions` is used only as a change-detection dependency below (the
  // reference changes after any create/edit/delete anywhere in the app) —
  // its contents are never rendered. Dashboard fetches its own month-scoped
  // data instead of reading the full unpaginated history.
  const { transactions, queryTransactions } = useTransactions();
  const { budgets, status: budgetsStatus, loadBudgets } = useBudgets();
  const { categoryBreakdown: budgetCategoryBreakdown, isLoading: isBudgetSpendingLoading } =
    useBudgetSpending();
  const { summary: dashboardSummary, isLoading: isDashboardSummaryLoading } = useDashboardSummary();
  const { occurrences, loadPendingOccurrences } = useScheduleOccurrences();
  const { payingOccurrence, openPayModal, closePayModal, handleCancelOccurrence } =
    useScheduleOccurrenceActions();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [correctionState, setCorrectionState] = useState<CorrectionState | null>(null);

  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [monthSummary, setMonthSummary] = useState<TransactionSummary | null>(null);
  const [completedQueryKey, setCompletedQueryKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    if (budgetsStatus === "idle") void loadBudgets();
  }, [budgetsStatus, loadBudgets]);

  useEffect(() => {
    void loadPendingOccurrences();
    // Deliberately runs once on mount only — same reasoning as TransactionsPage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset back to page 1 whenever the global `transactions` array reference
  // changes — i.e. after any create/edit/delete anywhere in the app (the
  // slice is only used as that change signal here) — so the accumulated
  // infinite-scroll list can't go stale or duplicated. refreshToken is baked
  // into queryKey so a mutation refetches even when already on page 1. Done
  // during render so the query effect below only ever sees the final page/token.
  const [refreshToken, setRefreshToken] = useState(0);
  const [prevTransactions, setPrevTransactions] = useState(transactions);
  if (prevTransactions !== transactions) {
    setPrevTransactions(transactions);
    setPage(1);
    setRefreshToken((token) => token + 1);
  }

  const currentMonth = formatMonthParam(startOfMonth(new Date()));
  const queryParams = {
    month: currentMonth,
    page,
    limit: MONTH_LIST_PAGE_SIZE,
  };
  const queryKey = JSON.stringify({ ...queryParams, refreshToken });
  // Only occurrences due within the current month, matching the widget's own
  // month-scoped query above.
  const visibleOccurrences = filterOccurrencesForView(occurrences, { month: currentMonth });
  const isQueryLoading = page === 1 && completedQueryKey !== queryKey;
  const isLoadingMore = page > 1 && completedQueryKey !== queryKey;
  const hasMore = page < totalPages;

  useEffect(() => {
    let cancelled = false;

    void queryTransactions(queryParams).then((result) => {
      if (cancelled) return;
      setDisplayedTransactions((prev) =>
        page === 1 ? result.transactions : [...prev, ...result.transactions],
      );
      setTotalPages(result.totalPages ?? 0);
      setMonthTotal(result.total ?? 0);
      setMonthSummary(result.summary);
      setCompletedQueryKey(queryKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, queryTransactions]);

  // Infinite scroll: advance the page once the sentinel at the bottom of the
  // list comes into view, instead of a numbered-page Pagination widget.
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setPage((prev) => prev + 1);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

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
            <BudgetsSummary
              budgets={budgets}
              categoryBreakdown={budgetCategoryBreakdown}
              isLoading={budgetsStatus !== "loaded" || isBudgetSpendingLoading}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div className="w-full sm:flex-1">
                <MonthlySummaryCard
                  summary={dashboardSummary}
                  transactionCount={monthTotal}
                  isLoading={isDashboardSummaryLoading || isQueryLoading}
                />
              </div>
              <div className="w-full sm:flex-1">
                <FinancialHealthCard
                  summary={dashboardSummary}
                  isLoading={isDashboardSummaryLoading}
                />
              </div>
            </div>
            <ExpenseByCategoryChart summary={monthSummary} isLoading={isQueryLoading} />
          </div>
          <div className="flex-1 w-full overflow-hidden space-y-4">
            <div className="w-full">
              <WalletQuickSwitcher
                onCorrectBalance={(wallet) => setCorrectionState({ wallet, transaction: null })}
              />
            </div>
            <TransactionList
              transactions={displayedTransactions}
              occurrences={visibleOccurrences}
              categories={categories}
              wallets={wallets}
              onEditTransaction={handleEditTransaction}
              onPayOccurrence={openPayModal}
              onCancelOccurrence={(occurrence) => void handleCancelOccurrence(occurrence)}
              headerAction={
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.TRANSACTIONS)}
                  className="text-[13px] font-bold text-primary-600 hover:underline dark:text-primary-400"
                >
                  {t("dashboard.viewAll")}
                </button>
              }
              isLoading={
                isQueryLoading || walletsStatus !== "loaded" || categoriesStatus !== "loaded"
              }
            />

            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-4">
                {isLoadingMore && <IconLoader className="h-5 w-5 animate-spin text-primary-500" />}
              </div>
            )}
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

      <PayOccurrenceModal
        isOpen={payingOccurrence !== null}
        occurrence={payingOccurrence}
        onClose={closePayModal}
      />
    </DashboardLayout>
  );
}
