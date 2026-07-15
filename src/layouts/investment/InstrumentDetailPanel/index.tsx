import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePencil, HiOutlinePlus, HiXMark } from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { InstrumentHistoryChart } from "@/layouts/investment/InstrumentHistoryChart";
import { InvestmentAccountCard } from "@/layouts/investment/InvestmentAccountCard";
import { InvestmentTransactionList } from "@/layouts/investment/InvestmentTransactionList";
import { getAccountTotals, getInstrumentTotals } from "@/utils/investment";
import { buildAccountTimeline, buildInstrumentTimeline } from "@/utils/investment-timeline";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface InstrumentDetailPanelProps {
  instrument: Instrument;
  instruments: Instrument[];
  investmentTransactions: InvestmentTransaction[];
  selectedAccountId: string | null;
  onSelectAccount: (idInvestmentAccount: string | null) => void;
  onEdit: () => void;
  onClose: () => void;
  onAddAccount: () => void;
  onEditAccount: (account: InvestmentAccount) => void;
  onWithdrawAccount: (account: InvestmentAccount) => void;
  onProfitLossAccount: (account: InvestmentAccount) => void;
  onEditTransaction: (transaction: InvestmentTransaction) => void;
  isLoading?: boolean;
}

export function InstrumentDetailPanel({
  instrument,
  instruments,
  investmentTransactions,
  selectedAccountId,
  onSelectAccount,
  onEdit,
  onClose,
  onAddAccount,
  onEditAccount,
  onWithdrawAccount,
  onProfitLossAccount,
  onEditTransaction,
  isLoading = false,
}: InstrumentDetailPanelProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  const selectedAccount =
    instrument.investmentAccounts.find(
      (account) => account.idInvestmentAccount === selectedAccountId,
    ) ?? null;
  const activeAccounts = useMemo(
    () => instrument.investmentAccounts.filter((account) => !account.isDeleted),
    [instrument],
  );

  const totals = useMemo(
    () => (selectedAccount ? getAccountTotals(selectedAccount) : getInstrumentTotals(instrument)),
    [selectedAccount, instrument],
  );
  const history = useMemo(
    () =>
      selectedAccount
        ? buildAccountTimeline(investmentTransactions, selectedAccount.idInvestmentAccount)
        : buildInstrumentTimeline(investmentTransactions, instrument),
    [selectedAccount, investmentTransactions, instrument],
  );
  const accountTransactions = useMemo(
    () =>
      selectedAccount
        ? investmentTransactions.filter(
            (item) =>
              item.idInvestmentAccount === selectedAccount.idInvestmentAccount ||
              item.idInvestmentAccountTo === selectedAccount.idInvestmentAccount,
          )
        : [],
    [selectedAccount, investmentTransactions],
  );
  const isPositive = totals.profitLoss >= 0;

  return (
    <div className="relative flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
            {selectedAccount
              ? t("investment.detailTitleWithAccount", {
                  name: instrument.nameInstrument,
                  account: selectedAccount.nameInvestmentAccount,
                })
              : t("investment.detailTitle", { name: instrument.nameInstrument })}
          </Words>
          <button
            type="button"
            onClick={onEdit}
            aria-label={t("investment.editTitle")}
            title={t("investment.editTitle")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800 dark:hover:text-ink-300"
          >
            <HiOutlinePencil className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800 dark:hover:text-ink-300"
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      {history.length > 0 ? (
        <InstrumentHistoryChart data={history} color={instrument.color} />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-ink-200 dark:border-ink-800">
          <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
            {t("investment.noHistory")}
          </Words>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {t("investment.investedAmount")}
          </Words>
          <Words type="lg/bold" className="text-ink-900 dark:text-ink-50">
            {format(totals.investedAmount)}
          </Words>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {t("investment.currentValue")}
          </Words>
          <Words type="lg/bold" className="text-ink-900 dark:text-ink-50">
            {format(totals.currentValue)}
          </Words>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {t("investment.profitLoss")}
          </Words>
          <div className="flex items-baseline gap-2">
            <Words
              type="lg/bold"
              className={
                isPositive
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-red-500 dark:text-red-400"
              }
            >
              {format(totals.profitLoss)}
            </Words>
            <Words
              type="xs/bold"
              as="span"
              className={
                isPositive
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-red-500 dark:text-red-400"
              }
            >
              {isPositive ? "↑" : "↓"} {Math.abs(totals.profitLossPercent).toFixed(2)}%
            </Words>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {t("investment.accountsLabel")}
        </Words>

        {activeAccounts.length === 0 && (
          <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
            {t("investment.noAccounts")}
          </Words>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {activeAccounts.map((account) => (
            <InvestmentAccountCard
              key={account.idInvestmentAccount}
              account={account}
              instrumentName={instrument.nameInstrument}
              color={instrument.color}
              investmentTransactions={investmentTransactions}
              isSelected={account.idInvestmentAccount === selectedAccountId}
              onSelect={() =>
                onSelectAccount(
                  selectedAccountId === account.idInvestmentAccount
                    ? null
                    : account.idInvestmentAccount,
                )
              }
              onEdit={() => onEditAccount(account)}
              onWithdraw={() => onWithdrawAccount(account)}
              onProfitLoss={() => onProfitLossAccount(account)}
            />
          ))}
          <button
            type="button"
            onClick={onAddAccount}
            aria-label={t("investment.addAccount")}
            className="flex min-h-[92px] items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400"
          >
            <HiOutlinePlus className="h-5 w-5" />
          </button>
        </div>

        {selectedAccount && (
          <InvestmentTransactionList
            title={t("investment.accountTransactionsTitle", {
              account: selectedAccount.nameInvestmentAccount,
            })}
            transactions={accountTransactions}
            instruments={instruments}
            emptyMessage={t("investment.noAccountTransactions")}
            onEditTransaction={onEditTransaction}
          />
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-16 backdrop-blur-[2px] dark:bg-ink-950/60">
          <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      )}
    </div>
  );
}
