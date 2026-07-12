import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { MonthTabs } from "@/layouts/transaction/MonthTabs";
import { TransactionFilterChips } from "@/layouts/transaction/TransactionFilterChips";
import {
  TransactionToolbar,
  type DateRangeFilter,
  type TransactionSortOption,
} from "@/layouts/transaction/TransactionToolbar";
import { TransactionSummaryBar } from "@/layouts/transaction/TransactionSummaryBar";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { AddTransactionFab } from "@/layouts/dashboard/AddTransactionFab";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";
import { BalanceCorrectionModal } from "@/layouts/wallet/BalanceCorrectionModal";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { formatMonthParam, generateMonthRange, startOfMonth } from "@/utils/month";
import type { Transaction, TransactionListParams } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

const SEARCH_DEBOUNCE_MS = 2000;

interface CorrectionState {
  wallet: WalletAccount;
  transaction: Transaction | null;
}

interface DisplaySortConfig {
  dateGroupOrder: "desc" | "asc";
  sortWithinDay: "chronological" | "amountDesc" | "amountAsc";
}

const DISPLAY_SORT_CONFIG: Record<TransactionSortOption, DisplaySortConfig> = {
  dateDesc: { dateGroupOrder: "desc", sortWithinDay: "chronological" },
  dateAsc: { dateGroupOrder: "asc", sortWithinDay: "chronological" },
  amountDesc: { dateGroupOrder: "desc", sortWithinDay: "amountDesc" },
  amountAsc: { dateGroupOrder: "desc", sortWithinDay: "amountAsc" },
};

export function TransactionsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { status: transactionsStatus, loadTransactions, queryTransactions } = useTransactions();

  const shouldFocusSearch = Boolean(
    (location.state as { focusSearch?: boolean } | null)?.focusSearch,
  );
  const focusSearchToken = shouldFocusSearch ? location.key : "";

  const months = useMemo(() => generateMonthRange(new Date(), 24, 12), []);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [walletFilter, setWalletFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>({ from: "", to: "" });
  const [sortOption, setSortOption] = useState<TransactionSortOption>("dateDesc");

  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [completedQueryKey, setCompletedQueryKey] = useState<string | null>(null);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [correctionState, setCorrectionState] = useState<CorrectionState | null>(null);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    if (transactionsStatus === "idle") void loadTransactions();
  }, [transactionsStatus, loadTransactions]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams: TransactionListParams = {
    month: formatMonthParam(selectedMonth),
    idWallet: walletFilter !== "all" ? walletFilter : undefined,
    idCategory: categoryFilter !== "all" ? categoryFilter : undefined,
    idSubCategory: subCategoryFilter !== "all" ? subCategoryFilter : undefined,
    dateFrom: dateRange.from || undefined,
    dateTo: dateRange.to || undefined,
    search: debouncedSearch || undefined,
    sort: sortOption,
  };
  const queryKey = JSON.stringify(queryParams);
  const isQueryLoading = transactionsStatus === "loaded" && completedQueryKey !== queryKey;

  useEffect(() => {
    if (transactionsStatus !== "loaded") return;

    let cancelled = false;

    void queryTransactions(queryParams).then((result) => {
      if (cancelled) return;
      setDisplayedTransactions(result);
      setCompletedQueryKey(queryKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsStatus, queryKey, queryTransactions]);

  function handleSelectCategory(id: string) {
    setCategoryFilter(id);
    setSubCategoryFilter("all");
  }

  function handleEditTransaction(transaction: Transaction) {
    if (transaction.type === "correction") {
      const wallet = wallets.find((item) => item.idWallet === transaction.idWallet);
      if (wallet) setCorrectionState({ wallet, transaction });
      return;
    }
    setEditingTransaction(transaction);
  }

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const transaction of displayedTransactions) {
      if (transaction.type === "income") income += transaction.amount;
      if (transaction.type === "expense") expense += transaction.amount;
    }
    return { income, expense };
  }, [displayedTransactions]);

  const displaySortConfig = DISPLAY_SORT_CONFIG[sortOption];
  const hasActiveFilter =
    walletFilter !== "all" ||
    categoryFilter !== "all" ||
    subCategoryFilter !== "all" ||
    Boolean(searchQuery) ||
    Boolean(dateRange.from || dateRange.to);

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col gap-5">
        <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
          {t("nav.transactions")}
        </Words>

        <TransactionFilterChips
          wallets={wallets}
          categories={categories}
          selectedWalletId={walletFilter}
          onSelectWallet={setWalletFilter}
          selectedCategoryId={categoryFilter}
          onSelectCategory={handleSelectCategory}
          selectedSubCategoryId={subCategoryFilter}
          onSelectSubCategory={setSubCategoryFilter}
        />

        <TransactionToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onGoToCurrentMonth={() => setSelectedMonth(startOfMonth(new Date()))}
          sortOption={sortOption}
          onSortChange={setSortOption}
          focusSearchToken={focusSearchToken}
        />

        <MonthTabs months={months} selected={selectedMonth} onSelect={setSelectedMonth} />

        <TransactionSummaryBar expense={summary.expense} income={summary.income} />

        <TransactionList
          transactions={displayedTransactions}
          categories={categories}
          wallets={wallets}
          onEditTransaction={handleEditTransaction}
          title=""
          emptyMessage={hasActiveFilter ? t("transaction.noDataForFilter") : t("dashboard.noTransactions")}
          dateGroupOrder={displaySortConfig.dateGroupOrder}
          sortWithinDay={displaySortConfig.sortWithinDay}
          isLoading={isQueryLoading}
        />
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
