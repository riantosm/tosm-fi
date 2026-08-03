import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineArrowsRightLeft,
  HiOutlinePlus,
} from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { AnimatedHeight } from "@/components/atoms/AnimatedHeight";
import { NetWorthChart } from "@/layouts/investment/NetWorthChart";
import { InstrumentFilterChips } from "@/layouts/investment/InstrumentFilterChips";
import { InstrumentCard } from "@/layouts/investment/InstrumentCard";
import { AddInstrumentCard } from "@/layouts/investment/AddInstrumentCard";
import { InstrumentViewModeToggle } from "@/layouts/investment/InstrumentViewModeToggle";
import {
  InstrumentSortDropdown,
  type InstrumentSortOption,
} from "@/layouts/investment/InstrumentSortDropdown";
import { InstrumentFormModal } from "@/layouts/investment/InstrumentFormModal";
import { InstrumentDetailPanel } from "@/layouts/investment/InstrumentDetailPanel";
import { InvestmentAccountFormModal } from "@/layouts/investment/InvestmentAccountFormModal";
import { WithdrawalFormModal } from "@/layouts/investment/WithdrawalFormModal";
import { TransferFormModal } from "@/layouts/investment/TransferFormModal";
import { ProfitLossFormModal } from "@/layouts/investment/ProfitLossFormModal";
import { InvestmentTransactionToolbar } from "@/layouts/investment/InvestmentTransactionToolbar";
import { InvestmentTransactionList } from "@/layouts/investment/InvestmentTransactionList";
import { EditInvestmentTransactionModal } from "@/layouts/investment/EditInvestmentTransactionModal";
import { useInstruments } from "@/hooks/use-instruments";
import { useInstrumentViewMode } from "@/hooks/use-instrument-view-mode";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useFirstInvestmentDate } from "@/hooks/use-first-investment-date";
import { useNetWorthTimeline } from "@/hooks/use-net-worth-timeline";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { getInstrumentTotals, getPortfolioTotals } from "@/utils/investment";
import { resolveNetWorthPeriod, type NetWorthPeriodPreset } from "@/utils/net-worth-period";
import { cn } from "@/utils/cn";
import type {
  Instrument,
  InstrumentInput,
  InvestmentAccount,
  InvestmentAccountInput,
} from "@/types/instrument.types";
import type {
  InvestmentTimelinesResult,
  InvestmentTransaction,
  InvestmentTransactionListParams,
  InvestmentTransactionType,
  NetWorthTimelineGranularity,
} from "@/types/investment-transaction.types";

const SEARCH_DEBOUNCE_MS = 2000;
const PAGE_SIZE = 20;

interface AccountModalState {
  idInstrument: string;
  idInvestmentAccount: string | null;
}

interface AccountActionState {
  idInstrument: string;
  idInvestmentAccount: string;
}

export function InvestmentPage() {
  const { t } = useTranslation();
  const {
    instruments,
    status,
    loadInstruments,
    createInstrument,
    editInstrument,
    deleteInstrument,
    createInvestmentAccount,
    editInvestmentAccount,
    deleteInvestmentAccount,
  } = useInstruments();
  const { investmentTransactions, queryInvestmentTransactions, fetchTimelines } =
    useInvestmentTransactions();
  const isLoading = status === "loading";
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { viewMode: instrumentViewMode, setViewMode: setInstrumentViewMode } =
    useInstrumentViewMode();
  const [instrumentSortOption, setInstrumentSortOption] = useState<InstrumentSortOption>("amount");
  const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<string[]>([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<InvestmentTransaction | null>(null);

  const [instrumentModalState, setInstrumentModalState] = useState<{
    idInstrument: string | null;
  } | null>(null);
  const [isSubmittingInstrument, setIsSubmittingInstrument] = useState(false);
  const [isDeletingInstrument, setIsDeletingInstrument] = useState(false);

  const [accountModalState, setAccountModalState] = useState<AccountModalState | null>(null);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [withdrawalState, setWithdrawalState] = useState<AccountActionState | null>(null);
  const [profitLossState, setProfitLossState] = useState<AccountActionState | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const [netWorthGranularity, setNetWorthGranularity] =
    useState<NetWorthTimelineGranularity>("day");
  const [netWorthPeriod, setNetWorthPeriod] = useState<NetWorthPeriodPreset>("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<InvestmentTransactionType | "all">("all");
  const [instrumentFilter, setInstrumentFilter] = useState("all");

  const [displayedTransactions, setDisplayedTransactions] = useState<InvestmentTransaction[]>([]);
  const [completedQueryKey, setCompletedQueryKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Always refetch on mount (like TransactionsPage's queryTransactions effect)
  // instead of gating on status === "idle" — otherwise navigating away and
  // back within the same session would keep showing whatever was loaded
  // last, even if instruments/transactions changed elsewhere in the meantime.
  useEffect(() => {
    void loadInstruments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [timelines, setTimelines] = useState<InvestmentTimelinesResult>({
    accounts: {},
    instruments: {},
  });
  // Same "derive isLoading by comparing against what the last completed
  // fetch was for" trick as isQueryLoading below — avoids setting a loading
  // flag synchronously inside the effect body.
  const [completedTimelinesFor, setCompletedTimelinesFor] = useState(investmentTransactions);
  const isTimelinesLoading = completedTimelinesFor !== investmentTransactions;

  // investmentTransactions is only ever a mutation signal here (see the
  // filterKey/prevTransactions effect below) — its reference changes after
  // any create/edit/delete anywhere in the app, so refetching timelines when
  // it changes keeps every sparkline/history chart in sync without a
  // dedicated invalidation call site.
  useEffect(() => {
    let cancelled = false;
    void fetchTimelines().then((result) => {
      if (cancelled) return;
      setTimelines(result);
      setCompletedTimelinesFor(investmentTransactions);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchTimelines, investmentTransactions]);

  const [accountTransactions, setAccountTransactions] = useState<InvestmentTransaction[]>([]);
  const [completedAccountTransactionsFor, setCompletedAccountTransactionsFor] = useState<{
    selectedAccountId: string | null;
    investmentTransactions: InvestmentTransaction[];
  } | null>(null);
  const isAccountTransactionsLoading =
    Boolean(selectedAccountId) &&
    (completedAccountTransactionsFor?.selectedAccountId !== selectedAccountId ||
      completedAccountTransactionsFor?.investmentTransactions !== investmentTransactions);

  // Only the selected account's ledger rows are ever rendered (by
  // InvestmentTransactionList inside InstrumentDetailPanel, gated on
  // selectedAccount being set), so fetch just that scope instead of
  // filtering it out of a full-history array. No fetch when nothing's
  // selected — accountTransactions just goes unused until then.
  useEffect(() => {
    if (!selectedAccountId) return;
    let cancelled = false;
    void queryInvestmentTransactions({
      idInvestmentAccount: selectedAccountId,
      sort: "dateDesc",
    }).then((result) => {
      if (cancelled) return;
      setAccountTransactions(result.investmentTransactions);
      setCompletedAccountTransactionsFor({ selectedAccountId, investmentTransactions });
    });
    return () => {
      cancelled = true;
    };
  }, [selectedAccountId, queryInvestmentTransactions, investmentTransactions]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function selectInstrument(id: string | null) {
    setSelectedInstrumentId(id);
    setSelectedAccountId(null);
  }

  // Auto-select the first instrument only once, right after instruments
  // first become available — never re-trigger this after the user
  // deliberately closes the detail panel (which also sets id to null).
  // if (!hasAutoSelected && instruments.length > 0) {
  //   setHasAutoSelected(true);
  //   if (selectedInstrumentId === null) selectInstrument(instruments[0].idInstrument);
  // } else if (
  //   selectedInstrumentId !== null &&
  //   instruments.length > 0 &&
  //   !instruments.some((instrument) => instrument.idInstrument === selectedInstrumentId)
  // ) {
  //   selectInstrument(instruments[0].idInstrument);
  // }

  const visibleInstruments = useMemo(
    () =>
      selectedInstrumentIds.length === 0
        ? instruments
        : instruments.filter((instrument) =>
            selectedInstrumentIds.includes(instrument.idInstrument),
          ),
    [instruments, selectedInstrumentIds],
  );

  // If the instrument filter narrows the visible set and the currently
  // selected/detailed instrument falls outside of it, close the detail panel
  // instead of leaving it open on a now-hidden instrument.
  if (
    selectedInstrumentId !== null &&
    visibleInstruments.length > 0 &&
    !visibleInstruments.some((instrument) => instrument.idInstrument === selectedInstrumentId)
  ) {
    selectInstrument(null);
  }

  const selectedInstrument =
    visibleInstruments.find((instrument) => instrument.idInstrument === selectedInstrumentId) ??
    null;

  const portfolioTotals = useMemo(
    () => getPortfolioTotals(visibleInstruments),
    [visibleInstruments],
  );

  // Cards are always shown highest-first, whichever metric is chosen.
  const sortedInstruments = useMemo(() => {
    return [...visibleInstruments].sort((a, b) => {
      const totalsA = getInstrumentTotals(a);
      const totalsB = getInstrumentTotals(b);
      return instrumentSortOption === "amount"
        ? totalsB.currentValue - totalsA.currentValue
        : totalsB.profitLossPercent - totalsA.profitLossPercent;
    });
  }, [visibleInstruments, instrumentSortOption]);

  const firstInvestmentDate = useFirstInvestmentDate();
  const resolvedNetWorthPeriod = useMemo(
    () => resolveNetWorthPeriod(netWorthPeriod, new Date(), firstInvestmentDate),
    [netWorthPeriod, firstInvestmentDate],
  );
  const { data: netWorthTimeline, isLoading: isNetWorthLoading } = useNetWorthTimeline(
    netWorthGranularity,
    resolvedNetWorthPeriod.dateFrom,
    resolvedNetWorthPeriod.dateTo,
    selectedInstrumentIds,
  );

  const editingInstrument = instrumentModalState?.idInstrument
    ? (instruments.find(
        (instrument) => instrument.idInstrument === instrumentModalState.idInstrument,
      ) ?? null)
    : null;

  const accountModalInstrument = accountModalState
    ? (instruments.find(
        (instrument) => instrument.idInstrument === accountModalState.idInstrument,
      ) ?? null)
    : null;

  const editingAccount = accountModalState?.idInvestmentAccount
    ? (accountModalInstrument?.investmentAccounts.find(
        (account) => account.idInvestmentAccount === accountModalState.idInvestmentAccount,
      ) ?? null)
    : null;

  function resolveAccountAction(state: AccountActionState | null) {
    if (!state) return null;
    const instrument = instruments.find((item) => item.idInstrument === state.idInstrument);
    const account = instrument?.investmentAccounts.find(
      (item) => item.idInvestmentAccount === state.idInvestmentAccount,
    );
    if (!instrument || !account) return null;
    return { instrument, account };
  }

  const withdrawalTarget = resolveAccountAction(withdrawalState);
  const profitLossTarget = resolveAccountAction(profitLossState);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  function openCreateInstrumentModal() {
    setInstrumentModalState({ idInstrument: null });
  }

  function openEditInstrumentModal(instrument: Instrument) {
    setInstrumentModalState({ idInstrument: instrument.idInstrument });
  }

  async function handleInstrumentSubmit(input: InstrumentInput) {
    setIsSubmittingInstrument(true);
    try {
      if (instrumentModalState?.idInstrument) {
        await editInstrument(instrumentModalState.idInstrument, input);
      } else {
        const created = await createInstrument(input);
        selectInstrument(created.idInstrument);
      }
      setInstrumentModalState(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmittingInstrument(false);
    }
  }

  async function handleDeleteInstrument(id: string) {
    const confirmed = await confirm({
      title: t("investment.deleteConfirmTitle"),
      description: t("investment.deleteConfirmDescription"),
      confirmLabel: t("investment.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeletingInstrument(true);
    try {
      await deleteInstrument(id);
      setInstrumentModalState(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsDeletingInstrument(false);
    }
  }

  function openCreateAccountModal() {
    if (!selectedInstrument) return;
    setAccountModalState({
      idInstrument: selectedInstrument.idInstrument,
      idInvestmentAccount: null,
    });
  }

  function openEditAccountModal(account: InvestmentAccount) {
    setAccountModalState({
      idInstrument: account.idInstrument,
      idInvestmentAccount: account.idInvestmentAccount,
    });
  }

  async function handleAccountSubmit(input: InvestmentAccountInput) {
    if (!accountModalState) return;
    setIsSubmittingAccount(true);
    try {
      if (accountModalState.idInvestmentAccount) {
        await editInvestmentAccount(
          accountModalState.idInstrument,
          accountModalState.idInvestmentAccount,
          input,
        );
      } else {
        await createInvestmentAccount(accountModalState.idInstrument, input);
      }
      setAccountModalState(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmittingAccount(false);
    }
  }

  async function handleDeleteAccount(id: string) {
    if (!accountModalState) return;
    const confirmed = await confirm({
      title: t("investment.deleteAccountConfirmTitle"),
      description: t("investment.deleteAccountConfirmDescription"),
      confirmLabel: t("investment.deleteAccountConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      await deleteInvestmentAccount(accountModalState.idInstrument, id);
      setAccountModalState(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  const filterParams: Omit<InvestmentTransactionListParams, "page" | "limit"> = {
    idInstrument: instrumentFilter !== "all" ? instrumentFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    search: debouncedSearch || undefined,
    sort: "dateDesc",
  };
  const filterKey = JSON.stringify(filterParams);

  // Same "reset to page 1 whenever filters change or a mutation happens
  // anywhere in the app" trick as TransactionsPage — investmentTransactions
  // here is only ever used as that change signal, not rendered directly.
  const [refreshToken, setRefreshToken] = useState(0);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  const [prevTransactions, setPrevTransactions] = useState(investmentTransactions);
  if (prevFilterKey !== filterKey || prevTransactions !== investmentTransactions) {
    setPrevFilterKey(filterKey);
    setPrevTransactions(investmentTransactions);
    setPage(1);
    setRefreshToken((token) => token + 1);
  }

  const queryParams: InvestmentTransactionListParams = { ...filterParams, page, limit: PAGE_SIZE };
  const queryKey = JSON.stringify({ ...queryParams, refreshToken });
  const isQueryLoading = page === 1 && completedQueryKey !== queryKey;
  const isLoadingMore = page > 1 && completedQueryKey !== queryKey;
  const hasMore = page < totalPages;

  useEffect(() => {
    let cancelled = false;

    void queryInvestmentTransactions(queryParams).then((result) => {
      if (cancelled) return;
      setDisplayedTransactions((prev) =>
        page === 1 ? result.investmentTransactions : [...prev, ...result.investmentTransactions],
      );
      setTotalPages(result.totalPages ?? 0);
      setCompletedQueryKey(queryKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, queryInvestmentTransactions]);

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

  const hasActiveTransactionFilter =
    typeFilter !== "all" || instrumentFilter !== "all" || Boolean(searchQuery);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("nav.investment")}
          </Words>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
            >
              <HiOutlineArrowsRightLeft className="h-4 w-4" />
              <Words type="xs/bold" as="span">
                {t("investment.transferTitle")}
              </Words>
            </button>
            <button
              type="button"
              onClick={openCreateInstrumentModal}
              className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
            >
              <HiOutlinePlus className="h-4 w-4" />
              <Words type="xs/bold" as="span">
                {t("investment.addInstrument")}
              </Words>
            </button>
          </div>
        </div>

        {instruments.length === 0 ? (
          isLoading ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-200 p-10 text-center dark:border-ink-800">
              <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-200 p-10 text-center dark:border-ink-800">
              <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
                {t("investment.noInstruments")}
              </Words>
              <Words type="xs/regular" className="max-w-sm text-ink-400 dark:text-ink-500">
                {t("investment.noInstrumentsHint")}
              </Words>
            </div>
          )
        ) : (
          <>
            {instruments.length > 1 && (
              <InstrumentFilterChips
                instruments={instruments}
                selectedIds={selectedInstrumentIds}
                onChange={setSelectedInstrumentIds}
              />
            )}

            <NetWorthChart
              data={netWorthTimeline}
              total={portfolioTotals.currentValue}
              granularity={netWorthGranularity}
              onGranularityChange={setNetWorthGranularity}
              period={netWorthPeriod}
              onPeriodChange={setNetWorthPeriod}
              isLoading={isNetWorthLoading}
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
                  {t("investment.instrumentLabel")}
                </Words>
                <div className="flex shrink-0 items-center gap-1">
                  <div
                    className={cn(
                      "flex items-center gap-1 overflow-hidden transition-all duration-300 ease-in-out",
                      instrumentViewMode === "grid"
                        ? "w-0 opacity-0 pointer-events-none"
                        : "w-[68px] opacity-100",
                    )}
                  >
                    <Tooltip content={t("common.previous")}>
                      <button
                        type="button"
                        onClick={() => scrollByAmount(-240)}
                        aria-label={t("common.previous")}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
                      >
                        <HiChevronLeft className="h-4 w-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content={t("common.next")}>
                      <button
                        type="button"
                        onClick={() => scrollByAmount(240)}
                        aria-label={t("common.next")}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
                      >
                        <HiChevronRight className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </div>
                  <InstrumentSortDropdown
                    value={instrumentSortOption}
                    onChange={setInstrumentSortOption}
                  />
                  <InstrumentViewModeToggle
                    value={instrumentViewMode}
                    onChange={setInstrumentViewMode}
                  />
                </div>
              </div>

              <AnimatedHeight className="relative">
                <div
                  ref={scrollRef}
                  className={cn(
                    "gap-3 pb-1 transition-all duration-300 ease-in-out",
                    instrumentViewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "flex overflow-x-auto scrollbar-hide",
                  )}
                >
                  {sortedInstruments.map((instrument) => (
                    <InstrumentCard
                      key={instrument.idInstrument}
                      instrument={instrument}
                      sparkline={timelines.instruments[instrument.idInstrument] ?? []}
                      isSelected={instrument.idInstrument === selectedInstrumentId}
                      layout={instrumentViewMode}
                      onClick={() => {
                        if (instrument.idInstrument === selectedInstrumentId) {
                          selectInstrument(null);
                        } else {
                          selectInstrument(instrument.idInstrument);
                        }
                      }}
                    />
                  ))}
                  <AddInstrumentCard onClick={openCreateInstrumentModal} layout={instrumentViewMode} />
                </div>

                {(isLoading || isTimelinesLoading) && (
                  <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-6 backdrop-blur-[2px] dark:bg-ink-950/60">
                    <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
                  </div>
                )}
              </AnimatedHeight>
            </div>

            {selectedInstrument && (
              <InstrumentDetailPanel
                instrument={selectedInstrument}
                instruments={instruments}
                timelines={timelines}
                accountTransactions={accountTransactions}
                isAccountTransactionsLoading={isAccountTransactionsLoading}
                selectedAccountId={selectedAccountId}
                onSelectAccount={setSelectedAccountId}
                onEdit={() => openEditInstrumentModal(selectedInstrument)}
                onClose={() => selectInstrument(null)}
                onAddAccount={openCreateAccountModal}
                onEditAccount={openEditAccountModal}
                onWithdrawAccount={(account) =>
                  setWithdrawalState({
                    idInstrument: account.idInstrument,
                    idInvestmentAccount: account.idInvestmentAccount,
                  })
                }
                onProfitLossAccount={(account) =>
                  setProfitLossState({
                    idInstrument: account.idInstrument,
                    idInvestmentAccount: account.idInvestmentAccount,
                  })
                }
                onEditTransaction={setEditingTransaction}
                isLoading={isLoading || isTimelinesLoading}
              />
            )}

            <div className="flex flex-col gap-3">
              <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
                {t("investment.allTransactionsTitle")}
              </Words>

              <InvestmentTransactionToolbar
                instruments={instruments}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                instrumentFilter={instrumentFilter}
                onInstrumentFilterChange={setInstrumentFilter}
              />

              <InvestmentTransactionList
                transactions={displayedTransactions}
                instruments={instruments}
                emptyMessage={
                  hasActiveTransactionFilter
                    ? t("investment.noDataForFilter")
                    : t("investment.allTransactionsEmpty")
                }
                onEditTransaction={setEditingTransaction}
                isLoading={isQueryLoading}
              />

              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-4">
                  {isLoadingMore && (
                    <IconLoader className="h-5 w-5 animate-spin text-primary-500" />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <InstrumentFormModal
        isOpen={instrumentModalState !== null}
        instrument={editingInstrument}
        isSubmitting={isSubmittingInstrument}
        isDeleting={isDeletingInstrument}
        onClose={() => setInstrumentModalState(null)}
        onSubmit={handleInstrumentSubmit}
        onDelete={handleDeleteInstrument}
      />

      <InvestmentAccountFormModal
        isOpen={accountModalState !== null}
        account={editingAccount}
        isSubmitting={isSubmittingAccount}
        isDeleting={isDeletingAccount}
        onClose={() => setAccountModalState(null)}
        onSubmit={handleAccountSubmit}
        onDelete={handleDeleteAccount}
      />

      {withdrawalTarget && (
        <WithdrawalFormModal
          isOpen={withdrawalState !== null}
          instrument={withdrawalTarget.instrument}
          account={withdrawalTarget.account}
          onClose={() => setWithdrawalState(null)}
        />
      )}

      {profitLossTarget && (
        <ProfitLossFormModal
          isOpen={profitLossState !== null}
          instrument={profitLossTarget.instrument}
          account={profitLossTarget.account}
          onClose={() => setProfitLossState(null)}
        />
      )}

      <TransferFormModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />

      <EditInvestmentTransactionModal
        isOpen={editingTransaction !== null}
        transaction={editingTransaction}
        instruments={instruments}
        onClose={() => setEditingTransaction(null)}
      />
    </DashboardLayout>
  );
}
