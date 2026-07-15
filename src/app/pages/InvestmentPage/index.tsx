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
import { NetWorthChart } from "@/layouts/investment/NetWorthChart";
import { InstrumentCard } from "@/layouts/investment/InstrumentCard";
import { AddInstrumentCard } from "@/layouts/investment/AddInstrumentCard";
import { InstrumentFormModal } from "@/layouts/investment/InstrumentFormModal";
import { InstrumentDetailPanel } from "@/layouts/investment/InstrumentDetailPanel";
import { InvestmentAccountFormModal } from "@/layouts/investment/InvestmentAccountFormModal";
import { WithdrawalFormModal } from "@/layouts/investment/WithdrawalFormModal";
import { TransferFormModal } from "@/layouts/investment/TransferFormModal";
import { ProfitLossFormModal } from "@/layouts/investment/ProfitLossFormModal";
import { InvestmentTransactionList } from "@/layouts/investment/InvestmentTransactionList";
import { EditInvestmentTransactionModal } from "@/layouts/investment/EditInvestmentTransactionModal";
import { useInstruments } from "@/hooks/use-instruments";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { getPortfolioTotals } from "@/utils/investment";
import { buildPortfolioTimeline } from "@/utils/investment-timeline";
import type {
  Instrument,
  InstrumentInput,
  InvestmentAccount,
  InvestmentAccountInput,
} from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

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
  const {
    investmentTransactions,
    status: investmentTransactionsStatus,
    loadInvestmentTransactions,
  } = useInvestmentTransactions();
  const isLoading = status === "loading" || investmentTransactionsStatus === "loading";
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);
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

  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Always refetch on mount (like TransactionsPage's queryTransactions effect)
  // instead of gating on status === "idle" — otherwise navigating away and
  // back within the same session would keep showing whatever was loaded
  // last, even if instruments/transactions changed elsewhere in the meantime.
  useEffect(() => {
    void loadInstruments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadInvestmentTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectInstrument(id: string | null) {
    setSelectedInstrumentId(id);
    setSelectedAccountId(null);
  }

  // Auto-select the first instrument only once, right after instruments
  // first become available — never re-trigger this after the user
  // deliberately closes the detail panel (which also sets id to null).
  if (!hasAutoSelected && instruments.length > 0) {
    setHasAutoSelected(true);
    if (selectedInstrumentId === null) selectInstrument(instruments[0].idInstrument);
  } else if (
    selectedInstrumentId !== null &&
    instruments.length > 0 &&
    !instruments.some((instrument) => instrument.idInstrument === selectedInstrumentId)
  ) {
    selectInstrument(instruments[0].idInstrument);
  }

  const selectedInstrument =
    instruments.find((instrument) => instrument.idInstrument === selectedInstrumentId) ?? null;

  const portfolioTotals = useMemo(() => getPortfolioTotals(instruments), [instruments]);
  const portfolioHistory = useMemo(
    () => buildPortfolioTimeline(investmentTransactions, instruments),
    [investmentTransactions, instruments],
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
            <NetWorthChart
              data={portfolioHistory}
              total={portfolioTotals.currentValue}
              isLoading={isLoading}
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
                  {t("investment.instrumentLabel")}
                </Words>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollByAmount(-240)}
                    aria-label={t("common.back")}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
                  >
                    <HiChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByAmount(240)}
                    aria-label={t("common.confirm")}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
                  >
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {instruments.map((instrument) => (
                    <InstrumentCard
                      key={instrument.idInstrument}
                      instrument={instrument}
                      investmentTransactions={investmentTransactions}
                      isSelected={instrument.idInstrument === selectedInstrumentId}
                      onClick={() => {
                        if (instrument.idInstrument === selectedInstrumentId) {
                          selectInstrument(null);
                        } else {
                          selectInstrument(instrument.idInstrument);
                        }
                      }}
                    />
                  ))}
                  <AddInstrumentCard onClick={openCreateInstrumentModal} />
                </div>

                {isLoading && (
                  <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-6 backdrop-blur-[2px] dark:bg-ink-950/60">
                    <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
                  </div>
                )}
              </div>
            </div>

            {selectedInstrument && (
              <InstrumentDetailPanel
                instrument={selectedInstrument}
                instruments={instruments}
                investmentTransactions={investmentTransactions}
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
                isLoading={isLoading}
              />
            )}

            <InvestmentTransactionList
              title={t("investment.allTransactionsTitle")}
              transactions={investmentTransactions}
              instruments={instruments}
              emptyMessage={t("investment.allTransactionsEmpty")}
              onEditTransaction={setEditingTransaction}
              isLoading={isLoading}
            />
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
