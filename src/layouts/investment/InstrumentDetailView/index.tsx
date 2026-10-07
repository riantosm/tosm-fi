import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import {
  LuChartLine,
  LuLayers,
  LuPencil,
  LuPlus,
  LuRotateCcw,
  LuTrendingUp,
  LuWallet,
  LuX,
} from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Monogram } from "@/components/atoms/Monogram";
import { Reveal } from "@/components/atoms/Reveal";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { AddInstrumentTile } from "@/layouts/investment/InstrumentCard";
import { InstrumentHistoryChart } from "@/layouts/investment/InstrumentHistoryChart";
import { InvestmentAccountCard } from "@/layouts/investment/InvestmentAccountCard";
import {
  InvestmentFilterChips,
  type InvestmentTypeFilter,
} from "@/layouts/investment/InvestmentTransactionToolbar";
import { InvestmentTransactionList } from "@/layouts/investment/InvestmentTransactionList";
import { MoneyAmount } from "@/layouts/investment/MoneyAmount";
import { ProfitLossPill } from "@/layouts/investment/ProfitLossPill";
import {
  bucketTimeline,
  formatPercent,
  formatRelativeDay,
  sumTimelines,
} from "@/layouts/investment/investment-ui";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { getInstrumentTotals, sumInvestmentAccounts } from "@/utils/investment";
import { cn } from "@/utils/cn";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";
import type {
  InvestmentTimelinesResult,
  InvestmentTransaction,
  NetWorthTimelineGranularity,
} from "@/types/investment-transaction.types";

const GRANULARITIES: NetWorthTimelineGranularity[] = ["day", "month", "year"];
const EASE = [0.22, 1, 0.36, 1] as const;

interface InstrumentDetailViewProps {
  instrument: Instrument;
  instruments: Instrument[];
  timelines: InvestmentTimelinesResult;
  isTimelinesLoading: boolean;
  onBack: () => void;
  onEditInstrument: () => void;
  onAddAccount: () => void;
  onEditAccount: (account: InvestmentAccount) => void;
  onWithdrawAccount: (account: InvestmentAccount) => void;
  onProfitLossAccount: (account: InvestmentAccount) => void;
  onEditTransaction: (transaction: InvestmentTransaction) => void;
}

/** Instrument detail (09 Investasi · Detail): value history for the picked accounts, account cards, ledger. */
export function InstrumentDetailView({
  instrument,
  instruments,
  timelines,
  isTimelinesLoading,
  onBack,
  onEditInstrument,
  onAddAccount,
  onEditAccount,
  onWithdrawAccount,
  onProfitLossAccount,
  onEditTransaction,
}: InstrumentDetailViewProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatNumber } = useMoneyFormat();
  const { investmentTransactions, queryInvestmentTransactions } = useInvestmentTransactions();

  // Empty = every account (the "semua akun" view).
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [granularity, setGranularity] = useState<NetWorthTimelineGranularity>("month");
  const [typeFilter, setTypeFilter] = useState<InvestmentTypeFilter>("all");

  const activeAccounts = useMemo(
    () => instrument.investmentAccounts.filter((account) => !account.isDeleted),
    [instrument],
  );
  const selectedAccounts = useMemo(
    () => activeAccounts.filter((account) => selectedIds.includes(account.idInvestmentAccount)),
    [activeAccounts, selectedIds],
  );
  const isSubset = selectedAccounts.length > 0;
  const scopeAccounts = isSubset ? selectedAccounts : activeAccounts;
  const totals = useMemo(() => sumInvestmentAccounts(scopeAccounts), [scopeAccounts]);
  const instrumentValue = getInstrumentTotals(instrument).currentValue;

  const history = useMemo(() => {
    const raw = isSubset
      ? sumTimelines(
          selectedAccounts.map((account) => timelines.accounts[account.idInvestmentAccount] ?? []),
        )
      : (timelines.instruments[instrument.idInstrument] ?? []);
    return bucketTimeline(raw, granularity);
  }, [isSubset, selectedAccounts, timelines, instrument.idInstrument, granularity]);
  const lastUpdate = history.length > 0 ? new Date(history[history.length - 1].date) : null;

  // Ledger for this instrument, refetched after any investment mutation (signal array).
  const [ledger, setLedger] = useState<InvestmentTransaction[]>([]);
  const ledgerKey = `${instrument.idInstrument}|${typeFilter}`;
  const [completedLedger, setCompletedLedger] = useState<{ key: string; signal: unknown } | null>(
    null,
  );
  const isLedgerLoading = completedLedger === null;
  const isLedgerRefreshing =
    completedLedger !== null &&
    (completedLedger.key !== ledgerKey || completedLedger.signal !== investmentTransactions);

  useEffect(() => {
    let cancelled = false;
    void queryInvestmentTransactions({
      idInstrument: instrument.idInstrument,
      type: typeFilter === "all" ? undefined : typeFilter,
      sort: "dateDesc",
    }).then((result) => {
      if (cancelled) return;
      setLedger(result.investmentTransactions);
      setCompletedLedger({ key: ledgerKey, signal: investmentTransactions });
    });
    return () => {
      cancelled = true;
    };
  }, [
    queryInvestmentTransactions,
    instrument.idInstrument,
    typeFilter,
    ledgerKey,
    investmentTransactions,
  ]);

  const visibleLedger = isSubset
    ? ledger.filter(
        (transaction) =>
          selectedIds.includes(transaction.idInvestmentAccount) ||
          (transaction.idInvestmentAccountTo !== null &&
            selectedIds.includes(transaction.idInvestmentAccountTo)),
      )
    : ledger;

  function toggleAccount(idInvestmentAccount: string) {
    setSelectedIds((prev) =>
      prev.includes(idInvestmentAccount)
        ? prev.filter((id) => id !== idInvestmentAccount)
        : [...prev, idInvestmentAccount],
    );
  }

  const accountCount = activeAccounts.length;
  const scopeLabel = isSubset
    ? t("investment.accountsSelected", { count: selectedAccounts.length })
    : t("investment.allAccounts");
  const selectedNames = selectedAccounts
    .map((account) => account.nameInvestmentAccount)
    .join(" + ");
  const updatedLabel = lastUpdate
    ? formatRelativeDay(lastUpdate, language, {
        today: t("transaction.today"),
        yesterday: t("transaction.yesterday"),
      })
    : null;
  const isLoss = totals.profitLoss < 0;

  const granularityControl = (fill: boolean) => (
    <SegmentedControl
      options={GRANULARITIES.map((option) => ({
        value: option,
        label: t(`investment.netWorth.granularity.${option}`),
      }))}
      value={granularity}
      onChange={setGranularity}
      fill={fill}
    />
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={instrument.nameInstrument}
        subtitle={t("investment.breadcrumb", {
          name: instrument.nameInstrument,
          count: accountCount,
        })}
        onBack={onBack}
        leading={
          <Monogram
            name={instrument.nameInstrument}
            color={instrument.color}
            variant="solid"
            shape="square"
            size="lg"
          />
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              leftIcon={<LuPencil />}
              onClick={onEditInstrument}
            >
              {t("investment.editTitle")}
            </Button>
            <Button type="button" leftIcon={<LuPlus />} onClick={onAddAccount}>
              {t("investment.addAccount")}
            </Button>
          </>
        }
        mobileActions={
          <>
            <IconButton
              label={t("investment.editTitle")}
              icon={<LuPencil />}
              variant="surface"
              size="lg"
              tooltip={false}
              onClick={onEditInstrument}
            />
            <IconButton
              label={t("investment.addAccount")}
              icon={<LuPlus />}
              variant="primary"
              size="lg"
              tooltip={false}
              onClick={onAddAccount}
            />
          </>
        }
      />

      <Reveal immediate>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="flex min-w-0 flex-col gap-3.5">
            {/* Phone summary */}
            <div className="flex flex-col gap-2.5 lg:hidden">
              <div className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[12.5px] text-text-3">
                    {t("investment.valueShort")} · {scopeLabel}
                  </span>
                  <span className="truncate font-num text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] text-text tabular">
                    {formatNumber(totals.currentValue)}
                  </span>
                </span>
                <ProfitLossPill
                  profitLoss={totals.profitLoss}
                  percent={totals.profitLossPercent}
                  showAmount
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2 rounded-control bg-primary-soft px-3 py-2 text-[12.5px] text-primary-text">
                <LuLayers className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {isSubset ? selectedNames : t("investment.allAccounts")}
                </span>
                {isSubset && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="shrink-0 font-semibold"
                  >
                    {t("common.all")}
                  </button>
                )}
              </div>
            </div>

            {/* Desktop header */}
            <div className="hidden items-start justify-between gap-4 lg:flex">
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2 className="font-display text-[18px] font-semibold text-text">
                  {t("investment.historyTitle")} · {scopeLabel}
                </h2>
                <AnimatePresence initial={false}>
                  {isSubset && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="flex flex-wrap gap-1.5 overflow-hidden"
                    >
                      {selectedAccounts.map((account) => (
                        <span
                          key={account.idInvestmentAccount}
                          className="flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pr-1 pl-1.5 text-[12.5px] text-text-2"
                        >
                          <Monogram
                            name={account.nameInvestmentAccount}
                            color={instrument.color}
                            shape="square"
                            size="xs"
                          />
                          {account.nameInvestmentAccount}
                          <button
                            type="button"
                            onClick={() => toggleAccount(account.idInvestmentAccount)}
                            aria-label={t("common.remove")}
                            className="flex size-5 items-center justify-center rounded-full text-text-3 hover:bg-surface-3 hover:text-text"
                          >
                            <LuX className="size-3" />
                          </button>
                        </span>
                      ))}
                    </m.div>
                  )}
                </AnimatePresence>
                <ChartLegend color={instrument.color} />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {isSubset && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="pressable flex h-[30px] animate-fade-in items-center gap-1.5 rounded-full bg-primary-soft px-3 text-[12.5px] font-semibold text-primary-text"
                  >
                    <LuRotateCcw className="size-3.5" />
                    {t("investment.showAll")}
                  </button>
                )}
                {granularityControl(false)}
              </div>
            </div>

            <div className="lg:hidden">
              <ChartLegend
                color={instrument.color}
                capitalLabel={t("investment.capitalShort", {
                  amount: formatNumber(totals.investedAmount),
                })}
              />
            </div>

            <div
              className={cn("transition-opacity duration-300", isTimelinesLoading && "opacity-50")}
            >
              {history.length > 0 ? (
                <InstrumentHistoryChart
                  data={history}
                  color={instrument.color}
                  granularity={granularity}
                />
              ) : (
                <div className="flex h-[150px] items-center justify-center rounded-control bg-surface-2 text-center text-[13px] text-text-3 lg:h-[230px]">
                  {t("investment.noHistory")}
                </div>
              )}
            </div>

            <div className="lg:hidden">{granularityControl(true)}</div>
          </Card>

          <div className="hidden flex-col gap-3 lg:flex">
            <StatCard
              icon={<LuWallet />}
              label={t("investment.capital")}
              value={totals.investedAmount}
            >
              {isSubset ? selectedNames : t("investment.allAccounts")}
            </StatCard>
            <StatCard
              icon={<LuChartLine />}
              label={t("investment.currentValue")}
              value={totals.currentValue}
            >
              {isSubset ? t("investment.selectedAccounts") : t("investment.allAccounts")}
              {updatedLabel && ` · ${t("investment.updatedOn", { date: updatedLabel })}`}
            </StatCard>
            <StatCard
              icon={<LuTrendingUp className={cn(isLoss && "-scale-y-100")} />}
              label={t("investment.plShort")}
              value={totals.profitLoss}
              sign={isLoss ? "−" : "+"}
              tone={isLoss ? "expense" : "income"}
            >
              {isLoss ? "▼" : "▲"} {formatPercent(totals.profitLossPercent, language)}{" "}
              {t("investment.ofCapital")} ·{" "}
              {t("investment.accountsShort", { count: scopeAccounts.length })}
            </StatCard>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <h2 className="font-display text-[17px] font-semibold text-text lg:text-[19px]">
            <span className="lg:hidden">{t("investment.accountsLabel")}</span>
            <span className="hidden lg:inline">
              {t("investment.accountsIn", { name: instrument.nameInstrument })}
            </span>
          </h2>
          <span className="hidden text-[12.5px] text-text-3 lg:inline">
            {t("investment.accountsHint")}
          </span>
          <span className="flex items-center gap-4 lg:hidden">
            <span className="text-[12px] text-text-3">{t("investment.tapToSelect")}</span>
            <button
              type="button"
              onClick={onAddAccount}
              className="flex items-center gap-1 text-[13px] font-semibold text-primary-text"
            >
              <LuPlus className="size-4" />
              {t("investment.addShort")}
            </button>
          </span>
        </div>

        {activeAccounts.length === 0 ? (
          <Card>
            <EmptyState
              title={t("investment.noAccounts")}
              description={t("investment.noAccountsHint")}
              action={
                <Button type="button" leftIcon={<LuPlus />} onClick={onAddAccount}>
                  {t("investment.addAccount")}
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {activeAccounts.map((account) => (
              <InvestmentAccountCard
                key={account.idInvestmentAccount}
                account={account}
                instrument={instrument}
                sparkline={timelines.accounts[account.idInvestmentAccount] ?? []}
                share={instrumentValue > 0 ? (account.currentValue / instrumentValue) * 100 : 0}
                isSelected={selectedIds.includes(account.idInvestmentAccount)}
                onToggleSelect={() => toggleAccount(account.idInvestmentAccount)}
                onEdit={() => onEditAccount(account)}
                onWithdraw={() => onWithdrawAccount(account)}
                onProfitLoss={() => onProfitLossAccount(account)}
              />
            ))}
            <AddInstrumentTile
              onClick={onAddAccount}
              label={t("investment.addAccount")}
              className="hidden min-h-[196px] lg:flex"
            />
          </div>
        )}
      </Reveal>

      <Reveal delay={0.08}>
        <Card className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="font-display text-[17px] font-semibold text-text lg:text-[19px]">
              {t("investment.instrumentTransactions", { name: instrument.nameInstrument })}
            </h2>
            <InvestmentFilterChips typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} />
          </div>
          <InvestmentTransactionList
            transactions={visibleLedger}
            instruments={instruments}
            emptyMessage={t("investment.noAccountTransactions")}
            onEditTransaction={onEditTransaction}
            isLoading={isLedgerLoading}
            isRefreshing={isLedgerRefreshing}
            layout="flat"
          />
        </Card>
      </Reveal>
    </div>
  );
}

function ChartLegend({ color, capitalLabel }: { color: string; capitalLabel?: string }) {
  const { t } = useTranslation();
  return (
    <span className="flex items-center gap-3.5 text-[12px] text-text-3">
      <span className="flex items-center gap-1.5">
        <span className="h-1 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="lg:hidden">{t("investment.valueShort")}</span>
        <span className="hidden lg:inline">{t("investment.currentValue")}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-2.5 rounded-full bg-text-3 opacity-55" />
        {capitalLabel ?? t("investment.capital")}
      </span>
    </span>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  sign?: string;
  tone?: "neutral" | "income" | "expense";
  children: ReactNode;
}

function StatCard({ icon, label, value, sign, tone = "neutral", children }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center gap-1.5 rounded-card p-6 shadow-card",
        tone === "income"
          ? "bg-income-soft"
          : tone === "expense"
            ? "bg-expense-soft"
            : "bg-surface",
      )}
    >
      <span className="flex items-center gap-2 text-[13px] text-text-2">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-[9px] [&_svg]:size-[15px]",
            tone === "neutral" ? "bg-surface-2" : "bg-surface",
          )}
        >
          {icon}
        </span>
        {label}
      </span>
      <MoneyAmount
        value={value}
        sign={sign}
        symbolClassName="text-[12.5px] text-text-3"
        numberClassName={cn(
          "text-[24px] leading-[1.15] tracking-[-0.02em]",
          tone === "income"
            ? "text-income-text"
            : tone === "expense"
              ? "text-expense-text"
              : "text-text",
        )}
      />
      <span className="truncate text-[12px] text-text-3">{children}</span>
    </div>
  );
}
