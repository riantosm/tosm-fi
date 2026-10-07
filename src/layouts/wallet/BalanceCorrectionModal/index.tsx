import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCalendarClock, LuTrash2, LuTrendingDown, LuTrendingUp, LuWallet } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { Textarea } from "@/components/atoms/Textarea";
import { AmountCard } from "@/components/molecules/AmountCard";
import { AmountCalculatorKeypad } from "@/components/molecules/AmountCalculatorKeypad";
import { FormField } from "@/components/molecules/FormField";
import { Modal } from "@/components/molecules/Modal";
import { PickerField } from "@/components/molecules/PickerField";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { useAmountCalculator } from "@/hooks/use-amount-calculator";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useCurrency } from "@/hooks/use-currency";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction, TransactionInput } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";
import { formatDateTimeLabel } from "@/utils/tx-time";

interface BalanceCorrectionModalProps {
  isOpen: boolean;
  wallet: WalletAccount | null;
  transaction?: Transaction | null;
  onClose: () => void;
}

export function BalanceCorrectionModal({
  isOpen,
  wallet,
  transaction,
  onClose,
}: BalanceCorrectionModalProps) {
  const session = useDialogSession(isOpen);
  return (
    <BalanceCorrectionDialog
      key={session}
      isOpen={isOpen && Boolean(wallet)}
      wallet={wallet}
      transaction={transaction ?? null}
      onClose={onClose}
    />
  );
}

function BalanceCorrectionDialog({
  isOpen,
  wallet: walletProp,
  transaction: transactionProp,
  onClose,
}: {
  isOpen: boolean;
  wallet: WalletAccount | null;
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { deleteTransaction } = useTransactions();
  const { showToast } = useToast();
  const { confirm } = useConfirmDialog();
  // Frozen for this dialog's lifetime: the parent clears its own state while we animate out.
  const [wallet] = useState(walletProp);
  const [transaction] = useState(transactionProp);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!transaction) return;
    const confirmed = await confirm({
      title: t("transaction.deleteConfirmTitle"),
      description: t("transaction.deleteConfirmDescription"),
      confirmLabel: t("transaction.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.idTransaction);
      showToast(t("transaction.deleteSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("transaction.genericError"), "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={t("wallet.correctionTitle")}
      subtitle={t("wallet.correctionSubtitle")}
      headerActions={
        transaction && (
          <IconButton
            label={t("transaction.deleteButton")}
            icon={<LuTrash2 />}
            size="sm"
            variant="danger"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          />
        )
      }
    >
      {wallet && (
        <BalanceCorrectionFields wallet={wallet} transaction={transaction} onClose={onClose} />
      )}
    </Modal>
  );
}

function BalanceCorrectionFields({
  wallet,
  transaction,
  onClose,
}: {
  wallet: WalletAccount;
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();
  const { formatSigned } = useMoneyFormat();
  const { createTransaction, editTransaction } = useTransactions();
  const { showToast } = useToast();

  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [date, setDate] = useState(() => (transaction ? new Date(transaction.date) : new Date()));
  const [isSaving, setIsSaving] = useState(false);
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);

  const baseBalance = transaction ? wallet.balance - transaction.amount : wallet.balance;

  async function handleSave(newBalance: number) {
    const delta = newBalance - baseBalance;
    if (delta === 0 && !transaction) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const input: TransactionInput = {
        type: "correction",
        idWallet: wallet.idWallet,
        idCategory: null,
        idSubCategory: null,
        idWalletFrom: null,
        idWalletTo: null,
        title: t("transaction.balanceCorrection"),
        notes: notes.trim(),
        amount: delta,
        date: date.toISOString(),
      };
      if (transaction) {
        await editTransaction(transaction.idTransaction, input);
        showToast(t("transaction.updateSuccess"), "success");
      } else {
        await createTransaction(input);
        showToast(t("transaction.createSuccess"), "success");
      }
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("transaction.genericError"), "error");
    } finally {
      setIsSaving(false);
    }
  }

  const calc = useAmountCalculator(wallet.balance, { onEnter: (value) => void handleSave(value) });

  const delta = calc.value - baseBalance;
  const DeltaIcon = delta < 0 ? LuTrendingDown : LuTrendingUp;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div
          className="flex items-center gap-3 rounded-[18px] p-3.5"
          style={{ backgroundColor: `${wallet.color}1F` }}
        >
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface"
            style={{ color: wallet.color }}
          >
            <LuWallet className="size-[18px]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[14px] font-semibold text-text">
                {wallet.nameWallet}
              </span>
              {wallet.isPrimary && (
                <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-text">
                  {t("wallet.primary")}
                </span>
              )}
            </span>
            <span className="truncate text-[12.5px] text-text-2">
              {t("wallet.recordedBalance", { amount: format(baseBalance) })}
            </span>
          </span>
        </div>

        <AmountCard
          amount={calc.value}
          amountLabel={calc.displayValue}
          align="end"
          caption={
            calc.hasExpression ? (
              <span className="tabular">
                {calc.expressionDisplay}
                <span className="ml-0.5 animate-pulse">|</span>
              </span>
            ) : (
              t("wallet.actualBalance")
            )
          }
          footer={
            <span
              key={delta === 0 ? "same" : delta < 0 ? "down" : "up"}
              className={cn(
                "mt-1.5 inline-flex max-w-full animate-fade-in items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
                delta === 0
                  ? "bg-surface text-text-3"
                  : delta < 0
                    ? "bg-expense-soft text-expense-text"
                    : "bg-income-soft text-income-text",
              )}
            >
              {delta !== 0 && <DeltaIcon className="size-3.5 shrink-0" />}
              <span className="truncate">
                {delta === 0
                  ? t("wallet.noDifference")
                  : t("wallet.differenceNote", { amount: formatSigned(delta) })}
              </span>
            </span>
          }
        />

        <PickerField
          id="correction-date"
          label={t("transaction.dateTimeLabel")}
          icon={<LuCalendarClock />}
          value={formatDateTimeLabel(date, language, {
            today: t("transaction.today"),
            yesterday: t("transaction.yesterday"),
          })}
          onClick={() => setIsDateTimePickerOpen(true)}
        />

        <FormField label={t("transaction.notesLabel")} htmlFor="correction-notes">
          <Textarea
            id="correction-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={t("transaction.notesPlaceholder")}
            rows={1}
          />
        </FormField>

        <AmountCalculatorKeypad
          onDigit={calc.handleDigit}
          onDecimal={calc.handleDecimal}
          onTripleZero={calc.handleTripleZero}
          onOperator={calc.handleOperator}
          onBackspace={calc.handleBackspace}
          decimalLabel={calc.decimalSeparator}
          confirmLabel={t("wallet.saveCorrection")}
          onConfirm={() => void handleSave(calc.value)}
          isConfirming={isSaving}
        />
      </div>

      <DateTimePickerModal
        isOpen={isDateTimePickerOpen}
        value={date}
        onClose={() => setIsDateTimePickerOpen(false)}
        onConfirm={setDate}
      />
    </>
  );
}
