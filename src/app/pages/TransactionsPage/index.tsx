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
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { PageHeader } from "@/components/molecules/PageHeader";
import { MonthTabs } from "@/layouts/transaction/MonthTabs";
import { ActiveFilterBanner } from "@/layouts/transaction/ActiveFilterBanner";
import {
  TransactionFilterButton,
  TransactionFilterSheet,
} from "@/layouts/transaction/TransactionFilterSheet";
import {
  DEFAULT_FILTERS,
  EMPTY_RANGE,
  buildIdFilterParams,
  countActiveFilters,
  type TransactionFilters,
  type TransactionTypeFilter,
} from "@/layouts/transaction/transaction-filters";
import {
  TransactionSearchField,
  type TransactionSortOption,
} from "@/layouts/transaction/TransactionToolbar";
import { TransactionSummaryBar } from "@/layouts/transaction/TransactionSummaryBar";
import { TransactionCalendar } from "@/layouts/transaction/TransactionCalendar";
import {
  TransactionYearCalendar,
  type YearMonthSummary,
} from "@/layouts/transaction/TransactionYearCalendar";
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
import { toIntlLocale } from "@/utils/locale";
import { formatMonthParam, generateMonthRange, startOfMonth } from "@/utils/month";
import { parseIsoDate, toIsoDate } from "@/utils/calendar";
import { filterOccurrencesForView } from "@/utils/schedule-occurrence-filter";
import type {
  Transaction,
  TransactionListParams,
  TransactionSummary,
} from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

const EASE = [0.22, 1, 0.36, 1] as const;

const SEARCH_DEBOUNCE_MS = 1000;
const PAGE_SIZE = 20;

type CalendarViewMode = "month" | "year";

/** "YYYY-MM" when `range` covers exactly one whole calendar month, else null. */
function wholeMonthOf(range: { from: string; to: string }): string | null {
  if (!range.from || !range.to || !range.from.endsWith("-01")) return null;
  const start = parseIsoDate(range.from);
  const end = toIsoDate(new Date(start.getFullYear(), start.getMonth() + 1, 0));
  return range.to === end ? range.from.slice(0, 7) : null;
}

function monthRangeOf(monthKey: string): { from: string; to: string } {
  const start = parseIsoDate(`${monthKey}-01`);
  return {
    from: toIsoDate(start),
    to: toIsoDate(new Date(start.getFullYear(), start.getMonth() + 1, 0)),
  };
}

interface CorrectionState {
  wallet: WalletAccount;
  transaction: Transaction | null;
}

interface TransactionsPageLocationState {
  focusSearch?: boolean;
  typeFilter?: TransactionTypeFilter;
  categoryFilter?: string;
  subCategoryFilter?: string;
  /** Reports' "Other" subcategory bucket: hide every named subcategory of `categoryFilter`. */
  subCategoryExcludeFilter?: string[];
  /** "YYYY-MM-DD" range — the report period the user came from. */
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Month to open on for a deep-linked range: the current month when today falls inside the range,
 * otherwise the range's last month.
 */
function monthForRange(dateFrom?: string, dateTo?: string): Date {
  const today = new Date();
  if (!dateFrom) return startOfMonth(today);
  const end = dateTo ?? dateFrom;
  const todayIso = toIsoDate(today);
  return startOfMonth(dateFrom <= todayIso && todayIso <= end ? today : parseIsoDate(end));
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
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => new Date(currentYear - 5 + index, 0, 1));
  }, []);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    monthForRange(locationState?.dateFrom, locationState?.dateTo),
  );
  const selectedYear = selectedMonth.getFullYear();
  const isYearView = viewMode === "year";
  // Lets other pages (e.g. MonthlySummaryCard's Pemasukan/Pengeluaran rows, or the dashboard's
  // category breakdown chart) deep-link here with a type/category/subcategory already selected.
  // Read once at mount via the lazy initializer — navigating here from elsewhere always mounts a
  // fresh TransactionsPage instance, so this never goes stale.
  const [filters, setFilters] = useState<TransactionFilters>(() => {
    const excluded = locationState?.subCategoryExcludeFilter ?? [];
    const dateFrom = locationState?.dateFrom;
    return {
      ...DEFAULT_FILTERS,
      type: locationState?.typeFilter ?? "all",
      categoryIds: locationState?.categoryFilter ? [locationState.categoryFilter] : [],
      subCategoryIds: locationState?.subCategoryFilter
        ? [locationState.subCategoryFilter]
        : excluded,
      subCategoryMode:
        !locationState?.subCategoryFilter && excluded.length > 0 ? "exclude" : "include",
      range: dateFrom ? { from: dateFrom, to: locationState?.dateTo ?? dateFrom } : EMPTY_RANGE,
    };
  });
  const { type: typeFilter, range: dateRange, sort } = filters;
  const idFilterParams = buildIdFilterParams(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
  const [yearMonths, setYearMonths] = useState<YearMonthSummary[]>([]);

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

  // The backend intersects `month` with dateFrom/dateTo, so a range crossing a month boundary
  // (a week/year/custom report period) drops `month` to show the whole range.
  const rangeSpansMonths =
    Boolean(dateRange.from && dateRange.to) &&
    dateRange.from.slice(0, 7) !== dateRange.to.slice(0, 7);
  // The year view lists the whole year until a month (or any range) is picked.
  const filterParams: Omit<TransactionListParams, "page" | "limit"> = {
    month: isYearView || rangeSpansMonths ? undefined : formatMonthParam(selectedMonth),
    type: typeFilter !== "all" ? typeFilter : undefined,
    ...idFilterParams,
    dateFrom: dateRange.from || (isYearView ? `${selectedYear}-01-01` : undefined),
    dateTo: dateRange.to || (isYearView ? `${selectedYear}-12-31` : undefined),
    search: debouncedSearch || undefined,
    sort,
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
  // Same idea one level up: the year grid highlights a month whenever the range is that month.
  const selectedYearMonth = wholeMonthOf(dateRange);

  function updateFilters(patch: Partial<TransactionFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function handleSelectDay(day: string | null) {
    updateFilters({ range: day ? { from: day, to: day } : EMPTY_RANGE });
  }

  // Selecting a month is a distinct action from picking a day within it —
  // switching months always resets to the "whole month" default view.
  function handleSelectMonth(nextMonth: Date) {
    setSelectedMonth(nextMonth);
    updateFilters({ range: EMPTY_RANGE });
  }

  // Keeps the month-of-year so switching back to the month view lands on the same month.
  function handleSelectYear(nextYear: Date) {
    handleSelectMonth(new Date(nextYear.getFullYear(), selectedMonth.getMonth(), 1));
  }

  function handleSelectYearMonth(monthKey: string | null) {
    updateFilters({ range: monthKey ? monthRangeOf(monthKey) : EMPTY_RANGE });
  }

  // Leaving the year view with a month picked opens that month's calendar.
  function handleViewModeChange(nextMode: CalendarViewMode) {
    setViewMode(nextMode);
    if (nextMode === "month" && selectedYearMonth) {
      handleSelectMonth(parseIsoDate(`${selectedYearMonth}-01`));
    } else {
      updateFilters({ range: EMPTY_RANGE });
    }
  }

  function handleOpenMonth(month: Date) {
    setViewMode("month");
    handleSelectMonth(month);
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
    ...idFilterParams,
    search: debouncedSearch || undefined,
  };
  const calendarQueryKey = JSON.stringify({ ...calendarQueryParams, viewMode, refreshToken });

  const isCalendarLoading = completedCalendarKey !== calendarQueryKey;

  // The year grid only needs each month's totals, never its rows: one `limit: 1` query per month
  // returns the server-side `summary` (and `total`) without shipping the year's transactions.
  useEffect(() => {
    let cancelled = false;

    if (isYearView) {
      const monthsOfYear = Array.from(
        { length: 12 },
        (_, index) => new Date(selectedYear, index, 1),
      );
      void Promise.all(
        monthsOfYear.map((month) =>
          queryTransactions({
            ...calendarQueryParams,
            month: formatMonthParam(month),
            page: 1,
            limit: 1,
          }).then((result) => ({ month, summary: result.summary, count: result.total ?? 0 })),
        ),
      ).then((results) => {
        if (cancelled) return;
        setYearMonths(results);
        setCompletedCalendarKey(calendarQueryKey);
      });
      return () => {
        cancelled = true;
      };
    }

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

  function handleEditTransaction(transaction: Transaction) {
    if (transaction.type === "correction") {
      const wallet = wallets.find((item) => item.idWallet === transaction.idWallet);
      if (wallet) setCorrectionState({ wallet, transaction });
      return;
    }
    setEditingTransaction(transaction);
  }

  const displaySortConfig = DISPLAY_SORT_CONFIG[sort];
  const hasActiveFilter =
    typeFilter !== "all" ||
    filters.walletIds.length > 0 ||
    filters.categoryIds.length > 0 ||
    filters.subCategoryIds.length > 0 ||
    Boolean(searchQuery) ||
    Boolean(dateRange.from || dateRange.to);
  const activeFilterCount = countActiveFilters(filters);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
  }

  const locale = toIntlLocale(language);
  const monthLabel = isYearView
    ? String(selectedYear)
    : new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(selectedMonth);
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
            <TransactionFilterButton
              count={activeFilterCount}
              onClick={() => setIsFilterOpen(true)}
            />
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
            <TransactionFilterButton
              variant="icon"
              count={activeFilterCount}
              onClick={() => setIsFilterOpen(true)}
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

      <Reveal immediate className="flex items-center gap-2">
        <SegmentedControl<CalendarViewMode>
          options={[
            { value: "month", label: t("transaction.viewMonth") },
            { value: "year", label: t("transaction.viewYear") },
          ]}
          value={viewMode}
          onChange={handleViewModeChange}
          variant="solid"
          ariaLabel={t("transaction.calendarView")}
          activeClassName="text-primary-text"
          thumbClassName="bg-primary-soft shadow-none"
          className="shrink-0"
        />
        {isYearView ? (
          <MonthTabs
            key="year"
            unit="year"
            months={years}
            selected={selectedMonth}
            onSelect={handleSelectYear}
            onGoToCurrent={() => handleSelectYear(new Date())}
            className="min-w-0 flex-1"
          />
        ) : (
          <MonthTabs
            key="month"
            months={months}
            selected={selectedMonth}
            onSelect={handleSelectMonth}
            onGoToCurrent={() => handleSelectMonth(startOfMonth(new Date()))}
            className="min-w-0 flex-1"
          />
        )}
      </Reveal>

      <Reveal immediate delay={0.05}>
        <TransactionSummaryBar expense={summary?.expense ?? 0} income={summary?.income ?? 0} />
      </Reveal>

      <ActiveFilterBanner
        filters={filters}
        search={searchQuery}
        wallets={wallets}
        categories={categories}
        locale={locale}
        matchCount={totalCount}
        onOpen={() => setIsFilterOpen(true)}
        onChange={updateFilters}
        onClearSearch={() => setSearchQuery("")}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <Reveal delay={0.05}>
          {isYearView ? (
            <TransactionYearCalendar
              year={selectedYear}
              months={yearMonths}
              selectedMonth={selectedYearMonth}
              onSelectMonth={handleSelectYearMonth}
              onOpenMonth={handleOpenMonth}
              isLoading={isCalendarLoading}
            />
          ) : (
            <TransactionCalendar
              month={selectedMonth}
              transactions={calendarTransactions}
              categories={categories}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              isLoading={isCalendarLoading}
            />
          )}
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

      <TransactionFilterSheet
        isOpen={isFilterOpen}
        value={filters}
        wallets={wallets}
        categories={categories}
        month={selectedMonth}
        locale={locale}
        onApply={setFilters}
        onClose={() => setIsFilterOpen(false)}
      />

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
