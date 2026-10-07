import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuPlus, LuSearch } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Reveal } from "@/components/atoms/Reveal";
import { Card } from "@/components/molecules/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { MonthTabs } from "@/layouts/transaction/MonthTabs";
import {
  TransactionFilterChips,
  type ActiveFilterChip,
  type TransactionTypeFilter,
} from "@/layouts/transaction/TransactionFilterChips";
import {
  TransactionSearchField,
  TransactionSortMenu,
  type DateRangeFilter,
  type TransactionSortOption,
} from "@/layouts/transaction/TransactionToolbar";
import { DateRangeFilterPopover } from "@/layouts/transaction/DateRangeFilterPopover";
import { TransactionSummaryBar } from "@/layouts/transaction/TransactionSummaryBar";
import { TransactionCalendar } from "@/layouts/transaction/TransactionCalendar";
import { TransactionList } from "@/layouts/dashboard/TransactionList";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";
import { BalanceCorrectionModal } from "@/layouts/wallet/BalanceCorrectionModal";
import { PayOccurrenceModal } from "@/layouts/schedule/PayOccurrenceModal";
import { useCategories } from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { useScheduleOccurrences } from "@/hooks/use-schedule-occurrences";
import { useScheduleOccurrenceActions } from "@/hooks/use-schedule-occurrence-actions";
import { formatShortDate, parseIsoDate } from "@/utils/calendar";
import { toIntlLocale } from "@/utils/locale";
import { formatMonthParam, generateMonthRange, startOfMonth } from "@/utils/month";
import { filterOccurrencesForView } from "@/utils/schedule-occurrence-filter";
import type {
  Transaction,
  TransactionListParams,
  TransactionSummary,
} from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

const EASE = [0.22, 1, 0.36, 1] as const;

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
  const { language } = useLanguage();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { openManualEntry } = useQuickAdd();
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
  const [categoryFilter, setCategoryFilter] = useState(
    () => locationState?.categoryFilter ?? "all",
  );
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
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Search lives in the desktop header; phones open a search row under the app bar.
  // Arriving with `focusSearch` (Dashboard search pill) opens/focuses it.
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(shouldFocusSearch);
  const [lastFocusSearchToken, setLastFocusSearchToken] = useState(focusSearchToken);
  if (focusSearchToken !== lastFocusSearchToken) {
    setLastFocusSearchToken(focusSearchToken);
    if (focusSearchToken) setIsMobileSearchOpen(true);
  }
  useEffect(() => {
    if (focusSearchToken && isDesktop) desktopSearchRef.current?.focus();
  }, [focusSearchToken, isDesktop]);

  const [calendarTransactions, setCalendarTransactions] = useState<Transaction[]>([]);
  const [completedCalendarKey, setCompletedCalendarKey] = useState<string | null>(null);

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
      setTotalCount(result.total);
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
  const calendarQueryParams: Omit<
    TransactionListParams,
    "page" | "limit" | "dateFrom" | "dateTo" | "sort"
  > = {
    month: formatMonthParam(selectedMonth),
    type: typeFilter !== "all" ? typeFilter : undefined,
    idWallet: walletFilter !== "all" ? walletFilter : undefined,
    idCategory: categoryFilter !== "all" ? categoryFilter : undefined,
    idSubCategory: subCategoryFilter !== "all" ? subCategoryFilter : undefined,
    search: debouncedSearch || undefined,
  };
  const calendarQueryKey = JSON.stringify({ ...calendarQueryParams, refreshToken });

  const isCalendarLoading = completedCalendarKey !== calendarQueryKey;

  useEffect(() => {
    let cancelled = false;

    void queryTransactions(calendarQueryParams).then((result) => {
      if (cancelled) return;
      setCalendarTransactions(result.transactions);
      setCompletedCalendarKey(calendarQueryKey);
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

  function resetFilters() {
    setTypeFilter("all");
    setWalletFilter("all");
    setCategoryFilter("all");
    setSubCategoryFilter("all");
    setSearchQuery("");
    setDateRange({ from: "", to: "" });
  }

  const locale = toIntlLocale(language);
  const extraActiveFilters: ActiveFilterChip[] = [
    ...(searchQuery
      ? [{ key: "search", label: `“${searchQuery}”`, onRemove: () => setSearchQuery("") }]
      : []),
    ...(dateRange.from || dateRange.to
      ? [
          {
            key: "date",
            label:
              dateRange.from === dateRange.to || !dateRange.to
                ? formatShortDate(parseIsoDate(dateRange.from || dateRange.to), locale)
                : `${formatShortDate(parseIsoDate(dateRange.from), locale)} – ${formatShortDate(parseIsoDate(dateRange.to), locale)}`,
            onRemove: () => setDateRange({ from: "", to: "" }),
          },
        ]
      : []),
  ];
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    selectedMonth,
  );
  const subtitle =
    totalCount !== null
      ? `${monthLabel} · ${t("transaction.countLabel", { count: totalCount })}`
      : monthLabel;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("nav.transactions")}
        subtitle={<span className="first-letter:uppercase">{subtitle}</span>}
        showSubtitleOnMobile={false}
        actions={
          <>
            <TransactionSearchField
              ref={desktopSearchRef}
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-[240px] xl:w-[300px]"
            />
            <DateRangeFilterPopover
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              align="end"
            />
            <TransactionSortMenu value={sortOption} onChange={setSortOption} align="end" />
            <Button type="button" leftIcon={<LuPlus />} onClick={openManualEntry}>
              {t("dashboard.recordTransaction")}
            </Button>
          </>
        }
        mobileActions={
          <>
            <IconButton
              label={t("transaction.searchPlaceholder")}
              icon={<LuSearch />}
              variant="surface"
              size="lg"
              tooltip={false}
              className={
                isMobileSearchOpen || searchQuery ? "bg-primary-soft text-primary-text" : undefined
              }
              onClick={() => setIsMobileSearchOpen((open) => !open)}
            />
            <DateRangeFilterPopover
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              variant="icon"
              align="end"
            />
            <TransactionSortMenu
              value={sortOption}
              onChange={setSortOption}
              variant="icon"
              align="end"
            />
          </>
        }
      />

      <AnimatePresence initial={false}>
        {(isMobileSearchOpen || Boolean(searchQuery)) && !isDesktop && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="-mt-2 overflow-hidden lg:hidden"
          >
            <TransactionSearchField
              value={searchQuery}
              onChange={setSearchQuery}
              autoFocus
              className="h-11"
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* Phones show summary before filters; desktop keeps DOM order (filters, then summary). */}
      <Reveal immediate className="max-lg:order-1">
        <MonthTabs
          months={months}
          selected={selectedMonth}
          onSelect={handleSelectMonth}
          onGoToCurrent={() => handleSelectMonth(startOfMonth(new Date()))}
        />
      </Reveal>

      <Reveal immediate delay={0.05} className="max-lg:order-3">
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
          extraActiveFilters={extraActiveFilters}
          matchCount={hasActiveFilter ? totalCount : null}
          onReset={resetFilters}
        />
      </Reveal>

      <Reveal immediate delay={0.05} className="max-lg:order-2">
        <TransactionSummaryBar expense={summary?.expense ?? 0} income={summary?.income ?? 0} />
      </Reveal>

      <div className="grid grid-cols-1 gap-4 max-lg:order-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <Reveal delay={0.05}>
          <TransactionCalendar
            month={selectedMonth}
            transactions={calendarTransactions}
            categories={categories}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            isLoading={isCalendarLoading}
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="flex flex-col">
            <TransactionList
              transactions={displayedTransactions}
              occurrences={visibleOccurrences}
              categories={categories}
              wallets={wallets}
              onEditTransaction={handleEditTransaction}
              onPayOccurrence={openPayModal}
              onCancelOccurrence={(occurrence) => void handleCancelOccurrence(occurrence)}
              title={
                hasActiveFilter ? t("transaction.filterResults") : t("transaction.allTransactions")
              }
              headerAction={
                totalCount !== null && (
                  <span
                    key={totalCount}
                    className="animate-fade-in text-[13px] text-text-3 tabular"
                  >
                    {totalCount}
                  </span>
                )
              }
              emptyMessage={
                hasActiveFilter ? t("transaction.noDataForFilter") : t("dashboard.noTransactions")
              }
              dateGroupOrder={displaySortConfig.dateGroupOrder}
              sortWithinDay={displaySortConfig.sortWithinDay}
              dayHeaderStyle="full"
              isLoading={isQueryLoading}
            />

            {hasMore && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center gap-2 pt-4 text-[13px] text-text-3"
              >
                {isLoadingMore && (
                  <>
                    <IconLoader className="size-4 animate-spin" />
                    {t("transaction.loadingMore")}
                  </>
                )}
              </div>
            )}
          </Card>
        </Reveal>
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
