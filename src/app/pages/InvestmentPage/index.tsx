import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import {
  LuArrowLeftRight,
  LuChartPie,
  LuCoins,
  LuPlus,
  LuSearch,
  LuTrash2,
  LuTrendingUp,
} from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { NetWorthChart, NetWorthHeroEmpty } from "@/layouts/investment/NetWorthChart";
import { InstrumentFilterChips } from "@/layouts/investment/InstrumentFilterChips";
import {
  AddInstrumentTile,
  InstrumentCard,
  InstrumentListRow,
} from "@/layouts/investment/InstrumentCard";
import { InstrumentViewModeToggle } from "@/layouts/investment/InstrumentViewModeToggle";
import {
  InstrumentSortMenu,
  type InstrumentSortOption,
} from "@/layouts/investment/InstrumentSortMenu";
import { InstrumentDetailView } from "@/layouts/investment/InstrumentDetailView";
import { InstrumentFormModal } from "@/layouts/investment/InstrumentFormModal";
import { InvestmentAccountFormModal } from "@/layouts/investment/InvestmentAccountFormModal";
import { WithdrawalFormModal } from "@/layouts/investment/WithdrawalFormModal";
import { TransferFormModal } from "@/layouts/investment/TransferFormModal";
import { ProfitLossFormModal } from "@/layouts/investment/ProfitLossFormModal";
import {
  InvestmentFilterChips,
  type InvestmentTypeFilter,
} from "@/layouts/investment/InvestmentTransactionToolbar";
import { InvestmentTransactionList } from "@/layouts/investment/InvestmentTransactionList";
import { EditInvestmentTransactionModal } from "@/layouts/investment/EditInvestmentTransactionModal";
import { TransactionSearchField } from "@/layouts/transaction/TransactionToolbar";
import { useInstruments } from "@/hooks/use-instruments";
import { useInstrumentViewMode } from "@/hooks/use-instrument-view-mode";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useFirstInvestmentDate } from "@/hooks/use-first-investment-date";
import { useNetWorthTimeline } from "@/hooks/use-net-worth-timeline";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { getInstrumentTotals, getPortfolioTotals } from "@/utils/investment";
import { resolveNetWorthPeriod, type NetWorthPeriodPreset } from "@/utils/net-worth-period";
import { cn } from "@/utils/cn";
import type {
  InstrumentInput,
  InvestmentAccount,
  InvestmentAccountInput,
} from "@/types/instrument.types";
import type {
  InvestmentTimelinesResult,
  InvestmentTransaction,
  InvestmentTransactionListParams,
  NetWorthTimelineGranularity,
} from "@/types/investment-transaction.types";

const SEARCH_DEBOUNCE_MS = 2000;
const PAGE_SIZE = 20;
const EASE = [0.22, 1, 0.36, 1] as const;
const VIEW_MOTION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: EASE },
} as const;
/** Phones have no granularity toggle — each period gets a sensible bucket size. */
const PHONE_GRANULARITY: Record<NetWorthPeriodPreset, NetWorthTimelineGranularity> = {
  month: "day",
  year: "month",
  all: "month",
};

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
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const { viewMode: instrumentViewMode, setViewMode: setInstrumentViewMode } =
    useInstrumentViewMode();
  const [instrumentSortOption, setInstrumentSortOption] = useState<InstrumentSortOption>("amount");
  const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<string[]>([]);
  const [detailInstrumentId, setDetailInstrumentId] = useState<string | null>(null);
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

  const [netWorthGranularity, setNetWorthGranularity] =
    useState<NetWorthTimelineGranularity>("month");
  const [netWorthPeriod, setNetWorthPeriod] = useState<NetWorthPeriodPreset>("year");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isPhoneSearchOpen, setIsPhoneSearchOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<InvestmentTypeFilter>("all");
  const [instrumentFilter, setInstrumentFilter] = useState("all");

  const [displayedTransactions, setDisplayedTransactions] = useState<InvestmentTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number | null>(null);
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

  // investmentTransactions is only ever a mutation signal here — its reference
  // changes after any create/edit/delete anywhere in the app, so refetching
  // timelines when it changes keeps every sparkline/history chart in sync.
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const detailInstrument = detailInstrumentId
    ? (instruments.find((instrument) => instrument.idInstrument === detailInstrumentId) ?? null)
    : null;

  function openDetail(idInstrument: string | null) {
    setDetailInstrumentId(idInstrument);
    window.scrollTo({ top: 0 });
  }

  // Drop ids of instruments that no longer exist (e.g. deleted from the detail view).
  const activeFilterIds = useMemo(
    () =>
      selectedInstrumentIds.filter((id) =>
        instruments.some((instrument) => instrument.idInstrument === id),
      ),
    [selectedInstrumentIds, instruments],
  );
  const visibleInstruments = useMemo(
    () =>
      activeFilterIds.length === 0
        ? instruments
        : instruments.filter((instrument) => activeFilterIds.includes(instrument.idInstrument)),
    [instruments, activeFilterIds],
  );

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
    activeFilterIds,
  );

  function handlePeriodChange(period: NetWorthPeriodPreset) {
    setNetWorthPeriod(period);
    if (!isDesktop) setNetWorthGranularity(PHONE_GRANULARITY[period]);
  }

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

  async function handleInstrumentSubmit(input: InstrumentInput) {
    setIsSubmittingInstrument(true);
    try {
      if (instrumentModalState?.idInstrument) {
        await editInstrument(instrumentModalState.idInstrument, input);
      } else {
        const created = await createInstrument(input);
        openDetail(created.idInstrument);
      }
      setInstrumentModalState(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmittingInstrument(false);
    }
  }

  async function handleDeleteInstrument(id: string) {
    const instrument = instruments.find((item) => item.idInstrument === id);
    const confirmed = await confirm({
      title: t("investment.deleteConfirmTitle", { name: instrument?.nameInstrument ?? "" }),
      description: t("investment.deleteConfirmDescription"),
      confirmLabel: t("investment.deleteInstrument"),
      cancelLabel: t("common.cancel"),
      destructive: true,
      icon: LuTrash2,
    });
    if (!confirmed) return;

    setIsDeletingInstrument(true);
    try {
      await deleteInstrument(id);
      setInstrumentModalState(null);
      if (detailInstrumentId === id) openDetail(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsDeletingInstrument(false);
    }
  }

  function openCreateAccountModal() {
    if (!detailInstrument) return;
    setAccountModalState({
      idInstrument: detailInstrument.idInstrument,
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
      title: t("investment.deleteAccountConfirmTitle", {
        name: editingAccount?.nameInvestmentAccount ?? "",
      }),
      description: t("investment.deleteAccountConfirmDescription"),
      confirmLabel: t("investment.deleteAccount"),
      cancelLabel: t("common.cancel"),
      destructive: true,
      icon: LuTrash2,
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
      setTotalTransactions(result.total);
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
  const isInitialLoading = status !== "loaded" && instruments.length === 0;
  const isEmpty = status === "loaded" && instruments.length === 0;
  const accountCount = instruments.reduce(
    (sum, instrument) =>
      sum + instrument.investmentAccounts.filter((account) => !account.isDeleted).length,
    0,
  );
  const subtitle = isEmpty
    ? t("investment.noInstruments")
    : `${t("investment.instrumentCount", { count: instruments.length })} · ${t("investment.accountsShort", { count: accountCount })}`;
  const openCreateInstrument = () => setInstrumentModalState({ idInstrument: null });

  const transactionList = (
    <InvestmentTransactionList
      transactions={displayedTransactions}
      instruments={instruments}
      emptyMessage={
        hasActiveTransactionFilter
          ? t("investment.noDataForFilter")
          : t("investment.allTransactionsEmpty")
      }
      onEditTransaction={setEditingTransaction}
      isLoading={isQueryLoading && displayedTransactions.length === 0}
      isRefreshing={isQueryLoading && displayedTransactions.length > 0}
    />
  );

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {detailInstrument ? (
          <m.div key={`detail-${detailInstrument.idInstrument}`} {...VIEW_MOTION}>
            <InstrumentDetailView
              instrument={detailInstrument}
              instruments={instruments}
              timelines={timelines}
              isTimelinesLoading={isTimelinesLoading}
              onBack={() => openDetail(null)}
              onEditInstrument={() =>
                setInstrumentModalState({ idInstrument: detailInstrument.idInstrument })
              }
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
            />
          </m.div>
        ) : (
          <m.div key="overview" {...VIEW_MOTION} className="flex flex-col gap-4 lg:gap-5">
            <PageHeader
              title={t("nav.investment")}
              subtitle={subtitle}
              showSubtitleOnMobile={!isEmpty}
              actions={
                <>
                  {!isEmpty && (
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<LuArrowLeftRight />}
                      onClick={() => setIsTransferOpen(true)}
                    >
                      {t("investment.transferShort")}
                    </Button>
                  )}
                  <Button type="button" leftIcon={<LuPlus />} onClick={openCreateInstrument}>
                    {t("investment.addInstrument")}
                  </Button>
                </>
              }
              mobileActions={
                !isEmpty && (
                  <>
                    <IconButton
                      label={t("investment.transferTitle")}
                      icon={<LuArrowLeftRight />}
                      variant="surface"
                      size="lg"
                      tooltip={false}
                      onClick={() => setIsTransferOpen(true)}
                    />
                    <IconButton
                      label={t("investment.addInstrument")}
                      icon={<LuPlus />}
                      variant="primary"
                      size="lg"
                      tooltip={false}
                      onClick={openCreateInstrument}
                    />
                  </>
                )
              }
            />

            {isEmpty ? (
              <>
                <Reveal immediate>
                  <NetWorthHeroEmpty />
                </Reveal>
                <Reveal delay={0.05}>
                  <Card className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-6 py-12 text-center lg:min-h-[440px]">
                    <EmptyIllustration />
                    <h2 className="mt-3 font-display text-[20px] font-semibold text-text lg:text-[22px]">
                      {t("investment.emptyTitle")}
                    </h2>
                    <p className="max-w-[460px] text-[13.5px] leading-[1.55] text-text-2">
                      {t("investment.noInstrumentsHint")}
                    </p>
                    <Button
                      type="button"
                      leftIcon={<LuPlus />}
                      onClick={openCreateInstrument}
                      className="mt-2"
                    >
                      {t("investment.addInstrument")}
                    </Button>
                  </Card>
                </Reveal>
              </>
            ) : isInitialLoading ? (
              <div className="flex flex-col gap-4 lg:gap-5">
                <Skeleton className="h-[330px] rounded-[24px] lg:h-[393px] lg:rounded-[28px]" />
                <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-[168px] rounded-card" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <Reveal immediate>
                  <NetWorthChart
                    data={netWorthTimeline}
                    totals={portfolioTotals}
                    granularity={netWorthGranularity}
                    onGranularityChange={setNetWorthGranularity}
                    period={netWorthPeriod}
                    onPeriodChange={handlePeriodChange}
                    isLoading={isNetWorthLoading}
                  />
                </Reveal>

                {/* Desktop: filter chips + sort + view toggle, then cards */}
                <Reveal delay={0.04} className="hidden flex-col gap-4 lg:flex">
                  <div className="flex items-center justify-between gap-4">
                    {instruments.length > 1 ? (
                      <InstrumentFilterChips
                        instruments={instruments}
                        selectedIds={activeFilterIds}
                        onChange={setSelectedInstrumentIds}
                      />
                    ) : (
                      <span />
                    )}
                    <div className="flex shrink-0 items-center gap-2">
                      <InstrumentSortMenu
                        value={instrumentSortOption}
                        onChange={setInstrumentSortOption}
                      />
                      <InstrumentViewModeToggle
                        value={instrumentViewMode}
                        onChange={setInstrumentViewMode}
                      />
                    </div>
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <m.div
                      key={instrumentViewMode}
                      {...VIEW_MOTION}
                      className={cn(
                        "transition-opacity duration-300",
                        isTimelinesLoading && "opacity-80",
                        instrumentViewMode === "grid"
                          ? "grid grid-cols-3 gap-4 xl:grid-cols-4"
                          : "-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pt-1 pb-3 scrollbar-hide",
                      )}
                    >
                      {sortedInstruments.map((instrument) => (
                        <InstrumentCard
                          key={instrument.idInstrument}
                          instrument={instrument}
                          sparkline={timelines.instruments[instrument.idInstrument] ?? []}
                          layout={instrumentViewMode}
                          onOpen={() => openDetail(instrument.idInstrument)}
                        />
                      ))}
                      <AddInstrumentTile
                        onClick={openCreateInstrument}
                        layout={instrumentViewMode}
                      />
                    </m.div>
                  </AnimatePresence>
                </Reveal>

                {/* Phone: instrument list card */}
                <Reveal delay={0.04} className="flex flex-col gap-2.5 lg:hidden">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="font-display text-[17px] font-semibold text-text">
                      {t("investment.instrumentLabel")}
                    </h2>
                    <InstrumentSortMenu
                      value={instrumentSortOption}
                      onChange={setInstrumentSortOption}
                      variant="text"
                    />
                  </div>
                  {instruments.length > 1 && (
                    <InstrumentFilterChips
                      instruments={instruments}
                      selectedIds={activeFilterIds}
                      onChange={setSelectedInstrumentIds}
                    />
                  )}
                  <Card padding="none" className="flex flex-col px-4 pb-1">
                    <div className="flex flex-col divide-y divide-border">
                      {sortedInstruments.map((instrument) => (
                        <InstrumentListRow
                          key={instrument.idInstrument}
                          instrument={instrument}
                          sparkline={timelines.instruments[instrument.idInstrument] ?? []}
                          onOpen={() => openDetail(instrument.idInstrument)}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={openCreateInstrument}
                      className="flex items-center justify-center gap-2 border-t border-border py-3.5 text-[13.5px] font-semibold text-primary-text"
                    >
                      <LuPlus className="size-4" />
                      {t("investment.addInstrument")}
                    </button>
                  </Card>
                </Reveal>

                {/* Ledger */}
                <Reveal delay={0.06} className="flex flex-col gap-2.5 lg:gap-0">
                  <div className="flex items-center justify-between gap-3 px-1 lg:hidden">
                    <h2 className="font-display text-[17px] font-semibold text-text">
                      {t("investment.ledgerTitleShort")}
                    </h2>
                    <IconButton
                      label={t("investment.searchPlaceholder")}
                      icon={<LuSearch />}
                      variant="surface"
                      size="sm"
                      tooltip={false}
                      className={cn(isPhoneSearchOpen && "bg-primary-soft text-primary-text")}
                      onClick={() => setIsPhoneSearchOpen((open) => !open)}
                    />
                  </div>
                  <AnimatePresence initial={false}>
                    {isPhoneSearchOpen && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: EASE }}
                        className="overflow-hidden lg:hidden"
                      >
                        <TransactionSearchField
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder={t("investment.searchPlaceholder")}
                          autoFocus
                        />
                      </m.div>
                    )}
                  </AnimatePresence>
                  <InvestmentFilterChips
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    instruments={instruments}
                    instrumentFilter={instrumentFilter}
                    onInstrumentFilterChange={setInstrumentFilter}
                    surface="page"
                    className="lg:hidden"
                  />

                  <Card className="flex flex-col gap-3 px-4 py-3 lg:gap-4 lg:p-6">
                    <div className="hidden items-center justify-between gap-4 lg:flex">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <h2 className="font-display text-[19px] font-semibold text-text">
                          {t("investment.allTransactionsTitle")}
                        </h2>
                        {totalTransactions !== null && (
                          <span className="text-[12.5px] text-text-3">
                            {t("investment.transactionCount", { count: totalTransactions })}
                          </span>
                        )}
                      </div>
                      <TransactionSearchField
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t("investment.searchPlaceholder")}
                        className="w-[300px] border-transparent bg-surface-2"
                      />
                    </div>
                    <InvestmentFilterChips
                      typeFilter={typeFilter}
                      onTypeFilterChange={setTypeFilter}
                      instruments={instruments}
                      instrumentFilter={instrumentFilter}
                      onInstrumentFilterChange={setInstrumentFilter}
                      className="hidden lg:flex"
                    />
                    {transactionList}
                    {hasMore && (
                      <div ref={sentinelRef} className="flex justify-center py-3">
                        {isLoadingMore && (
                          <IconLoader className="size-5 animate-spin text-primary" />
                        )}
                      </div>
                    )}
                  </Card>
                </Reveal>
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>

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
        instrument={accountModalInstrument}
        account={editingAccount}
        isSubmitting={isSubmittingAccount}
        isDeleting={isDeletingAccount}
        onClose={() => setAccountModalState(null)}
        onSubmit={handleAccountSubmit}
        onDelete={handleDeleteAccount}
      />

      <WithdrawalFormModal
        isOpen={withdrawalTarget !== null}
        instrument={withdrawalTarget?.instrument ?? null}
        account={withdrawalTarget?.account ?? null}
        onClose={() => setWithdrawalState(null)}
      />

      <ProfitLossFormModal
        isOpen={profitLossTarget !== null}
        instrument={profitLossTarget?.instrument ?? null}
        account={profitLossTarget?.account ?? null}
        timeline={
          profitLossTarget
            ? timelines.accounts[profitLossTarget.account.idInvestmentAccount]
            : undefined
        }
        onClose={() => setProfitLossState(null)}
      />

      <TransferFormModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />

      <EditInvestmentTransactionModal
        isOpen={editingTransaction !== null}
        transaction={editingTransaction}
        instruments={instruments}
        onClose={() => setEditingTransaction(null)}
      />
    </>
  );
}

/** Three tilted instrument tiles (Investasi · Kosong). */
function EmptyIllustration() {
  const tiles: { icon: typeof LuCoins; color: string; className: string }[] = [
    { icon: LuCoins, color: "#C29A4E", className: "-rotate-[8deg] translate-x-3 translate-y-2" },
    { icon: LuTrendingUp, color: "#5FA398", className: "z-10 -translate-y-1" },
    { icon: LuChartPie, color: "#8B8EE0", className: "rotate-[8deg] -translate-x-3 translate-y-1" },
  ];
  return (
    <div className="flex items-center" aria-hidden="true">
      {tiles.map(({ icon: Icon, color, className }, index) => (
        <span
          key={index}
          className={cn(
            "flex size-[68px] items-center justify-center rounded-[18px] text-white shadow-pop transition-transform duration-500 hover:scale-105",
            className,
          )}
          style={{ backgroundColor: color, opacity: index === 2 ? 0.9 : 1 }}
        >
          <Icon className="size-7" />
        </span>
      ))}
    </div>
  );
}
