import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineScale, HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { AmountCalculatorKeypad } from "@/components/molecules/AmountCalculatorKeypad";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { useAmountCalculator } from "@/hooks/use-amount-calculator";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { Transaction, TransactionInput } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

interface BalanceCorrectionModalProps {
  isOpen: boolean;
  wallet: WalletAccount | null;
  transaction?: Transaction | null;
  onClose: () => void;
}

function formatDateLabel(date: Date, locale: string, todayLabel: string): string {
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return todayLabel;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

function formatTimeLabel(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function BalanceCorrectionModal({
  isOpen,
  wallet,
  transaction,
  onClose,
}: BalanceCorrectionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {isOpen && wallet && (
        <BalanceCorrectionFields
          wallet={wallet}
          transaction={transaction ?? null}
          onClose={onClose}
        />
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
  const { createTransaction, editTransaction, deleteTransaction } = useTransactions();
  const { showToast } = useToast();
  const { confirm } = useConfirmDialog();

  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [date, setDate] = useState(() => (transaction ? new Date(transaction.date) : new Date()));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Words as="h2" type="xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("transaction.balanceCorrection")}
          </Words>
          <div className="flex shrink-0 items-center gap-1">
            {transaction && (
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                aria-label={t("transaction.deleteButton")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <HiOutlineTrash className="h-4 w-4" />
              </button>
            )}
            <ModalCloseButton onClose={onClose} />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-ink-100 p-4 dark:bg-ink-800">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-200 dark:bg-ink-700">
            <HiOutlineScale className="h-6 w-6" style={{ color: wallet.color }} />
          </div>
          <div className="flex min-w-0 flex-col">
            <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
              {wallet.nameWallet}
            </Words>
            <Words type="xs/regular" className="truncate text-ink-500 dark:text-ink-400">
              {t("wallet.currentBalance")}: {format(wallet.balance)}
            </Words>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex min-w-0 flex-col items-end gap-0.5">
            {calc.hasExpression && (
              <Words
                as="p"
                type="sm/regular"
                className="w-full truncate text-right text-ink-500 dark:text-ink-400"
              >
                {calc.expressionDisplay}
                <span className="ml-0.5 animate-pulse">|</span>
              </Words>
            )}
            <Words
              as="p"
              type={calc.formattedValue.length > 14 ? "xl/bold" : "3xl/bold"}
              className="w-full break-words text-right text-ink-900 dark:text-ink-50"
            >
              {calc.formattedValue}
            </Words>
          </div>
          <Words type="xs/regular" className="text-right text-ink-400 dark:text-ink-500">
            {t("wallet.newBalanceHint")}
          </Words>
        </div>

        <AmountCalculatorKeypad
          onDigit={calc.handleDigit}
          onDecimal={calc.handleDecimal}
          onTripleZero={calc.handleTripleZero}
          onOperator={calc.handleOperator}
          onBackspace={calc.handleBackspace}
        />

        <button
          type="button"
          onClick={() => setIsDateTimePickerOpen(true)}
          className="flex items-center gap-3 rounded-2xl border border-ink-200 p-3 transition-colors hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800">
            <HiOutlineCalendarDays className="h-4 w-4 text-ink-500 dark:text-ink-400" />
          </div>
          <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
            {formatDateLabel(date, language, t("transaction.today"))}
          </Words>
          <span className="flex-1" />
          <HiOutlineClock className="h-4 w-4 shrink-0 text-ink-400 dark:text-ink-500" />
          <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
            {formatTimeLabel(date, language)}
          </Words>
        </button>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t("transaction.notesPlaceholder")}
          rows={2}
          className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-colors focus:border-primary-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-primary-500"
        />

        <Button onClick={() => void handleSave(calc.value)} isLoading={isSaving} className="w-full">
          <Words type="sm/bold" as="span">
            {t("transaction.save")}
          </Words>
        </Button>
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
