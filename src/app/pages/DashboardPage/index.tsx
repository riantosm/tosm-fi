import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Reveal } from "@/components/atoms/Reveal";
import { Card } from "@/components/molecules/Card";
import { FinanceOverview } from "@/layouts/dashboard/FinanceOverview";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { MonthlySummaryCard } from "@/layouts/dashboard/MonthlySummaryCard";
import { FinancialHealthCard } from "@/layouts/dashboard/FinancialHealthCard";
import { ExpenseByCategoryChart } from "@/layouts/dashboard/ExpenseByCategoryChart";
import { BudgetsSummary } from "@/layouts/dashboard/BudgetsSummary";
import { WalletQuickSwitcher } from "@/layouts/dashboard/WalletQuickSwitcher";
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

  // Phones stack the cards in the design's own order (budgets first); from
  // `lg` the two column wrappers take over and `order` no longer applies.
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <Reveal immediate>
        <FinanceOverview summary={dashboardSummary} isLoading={isDashboardSummaryLoading} />
      </Reveal>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          <div className="contents xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-5">
            <Reveal className="order-2 h-full lg:order-none">
              <MonthlySummaryCard
                summary={dashboardSummary}
                transactionCount={monthTotal}
                isLoading={isDashboardSummaryLoading || isQueryLoading}
              />
            </Reveal>
            <Reveal className="order-3 lg:order-none" delay={0.05}>
              <FinancialHealthCard
                summary={dashboardSummary}
                isLoading={isDashboardSummaryLoading}
              />
            </Reveal>
          </div>

          <Reveal className="order-4 lg:order-none">
            <ExpenseByCategoryChart summary={monthSummary} isLoading={isQueryLoading} />
          </Reveal>

          <Reveal className="order-6 lg:order-none">
            <Card className="flex flex-col">
              <TransactionList
                transactions={displayedTransactions}
                occurrences={visibleOccurrences}
                categories={categories}
                wallets={wallets}
                onEditTransaction={handleEditTransaction}
                onPayOccurrence={openPayModal}
                onCancelOccurrence={(occurrence) => void handleCancelOccurrence(occurrence)}
                eyebrow={t("dashboard.activityEyebrow")}
                headerAction={
                  <SeeAllLink
                    label={t("dashboard.seeAll")}
                    onClick={() => navigate(ROUTES.TRANSACTIONS)}
                  />
                }
                isLoading={
                  isQueryLoading || walletsStatus !== "loaded" || categoriesStatus !== "loaded"
                }
              />

              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center pt-4">
                  {isLoadingMore && <IconLoader className="size-5 animate-spin text-primary" />}
                </div>
              )}
            </Card>
          </Reveal>
        </div>

        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          <Reveal className="order-5 lg:order-none" delay={0.05}>
            <WalletQuickSwitcher
              onCorrectBalance={(wallet) => setCorrectionState({ wallet, transaction: null })}
            />
          </Reveal>
          <Reveal className="order-1 lg:order-none" delay={0.1}>
            <BudgetsSummary
              budgets={budgets}
              categoryBreakdown={budgetCategoryBreakdown}
              isLoading={budgetsStatus !== "loaded" || isBudgetSpendingLoading}
            />
          </Reveal>
        </div>
      </div>

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
    </div>
  );
}

function SeeAllLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1 rounded-full text-[13px] font-semibold text-primary-text transition-colors hover:text-primary"
    >
      {label}
      <LuArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}
