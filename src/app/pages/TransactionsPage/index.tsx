import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { MonthTabs } from "@/layouts/transaction/MonthTabs";
import {
  TransactionFilterChips,
  type TransactionTypeFilter,
} from "@/layouts/transaction/TransactionFilterChips";
import {
  TransactionToolbar,
  type DateRangeFilter,
  type TransactionSortOption,
} from "@/layouts/transaction/TransactionToolbar";
import { TransactionSummaryBar } from "@/layouts/transaction/TransactionSummaryBar";
import { TransactionCalendar } from "@/layouts/transaction/TransactionCalendar";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { AddTransactionFab } from "@/layouts/dashboard/AddTransactionFab";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";
import { BalanceCorrectionModal } from "@/layouts/wallet/BalanceCorrectionModal";
import { PayOccurrenceModal } from "@/layouts/schedule/PayOccurrenceModal";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { useScheduleOccurrences } from "@/hooks/use-schedule-occurrences";
import { useScheduleOccurrenceActions } from "@/hooks/use-schedule-occurrence-actions";
import { formatMonthParam, generateMonthRange, startOfMonth } from "@/utils/month";
import { filterOccurrencesForView } from "@/utils/schedule-occurrence-filter";
import type { Transaction, TransactionListParams, TransactionSummary } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

const SEARCH_DEBOUNCE_MS = 2000;
const PAGE_SIZE = 20;

interface CorrectionState {
  wallet: WalletAccount;
  transaction: Transaction | null;
}

interface TransactionsPageLocationState {
  focusSearch?: boolean;
  typeFilter?: TransactionTypeFilter;
  categoryFilter?: string;
  subCategoryFilter?: string;
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
  const { transactions, queryTransactions } = useTransactions();
  const { occurrences, loadPendingOccurrences } = useScheduleOccurrences();
  const { payingOccurrence, openPayModal, closePayModal, handleCancelOccurrence } =
    useScheduleOccurrenceActions();

  const locationState = location.state as TransactionsPageLocationState | null;
  const shouldFocusSearch = Boolean(locationState?.focusSearch);
  const focusSearchToken = shouldFocusSearch ? location.key : "";

  const months = useMemo(() => generateMonthRange(new Date(), 24, 12), []);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  // Lets other pages (e.g. MonthlySummaryCard's Pemasukan/Pengeluaran rows, or the dashboard's
  // category breakdown chart) deep-link here with a type/category/subcategory already selected.
  // Read once at mount via the lazy initializer — navigating here from elsewhere always mounts a
  // fresh TransactionsPage instance, so this never goes stale.
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>(
    () => locationState?.typeFilter ?? "all",
  );
  const [walletFilter, setWalletFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(() => locationState?.categoryFilter ?? "all");
  const [subCategoryFilter, setSubCategoryFilter] = useState(
    () => locationState?.subCategoryFilter ?? "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>({ from: "", to: "" });
  const [sortOption, setSortOption] = useState<TransactionSortOption>("dateDesc");

  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [completedQueryKey, setCompletedQueryKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [calendarTransactions, setCalendarTransactions] = useState<Transaction[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [correctionState, setCorrectionState] = useState<CorrectionState | null>(null);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    void loadPendingOccurrences();
    // Deliberately runs once on mount only — occurrences are refreshed via
    // the hook's own dispatches after pay/cancel, not by re-invoking fetch
    // (which would also re-trigger the backend's catch-up generation).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterParams: Omit<TransactionListParams, "page" | "limit"> = {
    month: formatMonthParam(selectedMonth),
    type: typeFilter !== "all" ? typeFilter : undefined,
    idWallet: walletFilter !== "all" ? walletFilter : undefined,
    idCategory: categoryFilter !== "all" ? categoryFilter : undefined,
    idSubCategory: subCategoryFilter !== "all" ? subCategoryFilter : undefined,
    dateFrom: dateRange.from || undefined,
    dateTo: dateRange.to || undefined,
    search: debouncedSearch || undefined,
    sort: sortOption,
  };
  const filterKey = JSON.stringify(filterParams);

  // Pending occurrences that belong in the currently visible window — same
  // filters as the real-transaction query, applied client-side since
  // occurrences are already fully loaded (no server-side filtering needed).
  const visibleOccurrences = filterOccurrencesForView(occurrences, filterParams);

  // Reset back to page 1 whenever the filters change, or whenever the global
  // transactions array reference changes — i.e. after any create/edit/delete
  // anywhere in the app (the slice is only used as that change signal here) —
  // so the accumulated infinite-scroll list can't go stale or duplicated.
  // refreshToken is baked into queryKey so a mutation refetches even when
  // already on page 1. Done during render (React's adjust-state-on-change
  // pattern) instead of in an effect so the query effect below only ever sees
  // the final page/token — no wasted intermediate request.
  const [refreshToken, setRefreshToken] = useState(0);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  const [prevTransactions, setPrevTransactions] = useState(transactions);
  if (prevFilterKey !== filterKey || prevTransactions !== transactions) {
    setPrevFilterKey(filterKey);
    setPrevTransactions(transactions);
    setPage(1);
    setRefreshToken((token) => token + 1);
  }

  const queryParams: TransactionListParams = { ...filterParams, page, limit: PAGE_SIZE };
  const queryKey = JSON.stringify({ ...queryParams, refreshToken });
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
      setSummary(result.summary);
      setCompletedQueryKey(queryKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, queryTransactions]);

  // A single day is "selected" whenever the toolbar's date range collapses to
  // one day — the calendar drives this via onSelectDay, but a manual toolbar
  // range pick that happens to be one day highlights the same cell too, so
  // there's only one source of truth for "which day is filtered".
  const selectedDay = dateRange.from && dateRange.from === dateRange.to ? dateRange.from : null;

  function handleSelectDay(day: string | null) {
    setDateRange(day ? { from: day, to: day } : { from: "", to: "" });
  }

  // Selecting a month is a distinct action from picking a day within it —
  // switching months always resets to the "whole month" default view.
  function handleSelectMonth(nextMonth: Date) {
    setSelectedMonth(nextMonth);
    setDateRange({ from: "", to: "" });
  }

  // Independent of the paginated list above: fetches every transaction for
  // the visible month (unpaginated, per the backend's documented behavior
  // when page/limit are omitted) so the calendar can show a dot/net summary
  // for every day at once, not just whichever page has scrolled into view.
  // Respects every filter except the day range itself, since that's what
  // clicking a calendar cell sets.
  const calendarQueryParams: Omit<TransactionListParams, "page" | "limit" | "dateFrom" | "dateTo" | "sort"> = {
    month: formatMonthParam(selectedMonth),
    type: typeFilter !== "all" ? typeFilter : undefined,
    idWallet: walletFilter !== "all" ? walletFilter : undefined,
    idCategory: categoryFilter !== "all" ? categoryFilter : undefined,
    idSubCategory: subCategoryFilter !== "all" ? subCategoryFilter : undefined,
    search: debouncedSearch || undefined,
  };
  const calendarQueryKey = JSON.stringify({ ...calendarQueryParams, refreshToken });

  useEffect(() => {
    let cancelled = false;
    setIsCalendarLoading(true);

    void queryTransactions(calendarQueryParams).then((result) => {
      if (cancelled) return;
      setCalendarTransactions(result.transactions);
      setIsCalendarLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarQueryKey, queryTransactions]);

  // Infinite scroll: advance the page once the sentinel at the bottom of
  // the list comes into view, instead of a "Load More" button.
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

  const displaySortConfig = DISPLAY_SORT_CONFIG[sortOption];
  const hasActiveFilter =
    typeFilter !== "all" ||
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
          selectedType={typeFilter}
          onSelectType={setTypeFilter}
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
          onGoToCurrentMonth={() => handleSelectMonth(startOfMonth(new Date()))}
          sortOption={sortOption}
          onSortChange={setSortOption}
          focusSearchToken={focusSearchToken}
        />

        <MonthTabs months={months} selected={selectedMonth} onSelect={handleSelectMonth} />

        <TransactionSummaryBar expense={summary?.expense ?? 0} income={summary?.income ?? 0} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
          <TransactionCalendar
            month={selectedMonth}
            transactions={calendarTransactions}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            isLoading={isCalendarLoading}
          />

          <div className="flex flex-col gap-5">
            <TransactionList
              transactions={displayedTransactions}
              occurrences={visibleOccurrences}
              categories={categories}
              wallets={wallets}
              onEditTransaction={handleEditTransaction}
              onPayOccurrence={openPayModal}
              onCancelOccurrence={(occurrence) => void handleCancelOccurrence(occurrence)}
              title=""
              emptyMessage={hasActiveFilter ? t("transaction.noDataForFilter") : t("dashboard.noTransactions")}
              dateGroupOrder={displaySortConfig.dateGroupOrder}
              sortWithinDay={displaySortConfig.sortWithinDay}
              isLoading={isQueryLoading}
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
