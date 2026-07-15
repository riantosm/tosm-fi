import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCalendarDays, HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Checkbox } from "@/components/atoms/Checkbox";
import { IconLoader } from "@/components/atoms/IconLoader";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { resolveAccountLabel } from "@/utils/investment";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { CURRENCIES } from "@/constants/currencies";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface EditInvestmentTransactionModalProps {
  isOpen: boolean;
  transaction: InvestmentTransaction | null;
  instruments: Instrument[];
  onClose: () => void;
}

export function EditInvestmentTransactionModal({
  isOpen,
  transaction,
  instruments,
  onClose,
}: EditInvestmentTransactionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && transaction && (
        <EditInvestmentTransactionFields
          transaction={transaction}
          instruments={instruments}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function EditInvestmentTransactionFields({
  transaction,
  instruments,
  onClose,
}: {
  transaction: InvestmentTransaction;
  instruments: Instrument[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const currencySymbol = CURRENCIES.find((option) => option.code === currency)?.symbol ?? "IDR";
  const { editInvestmentTransaction, deleteInvestmentTransaction } = useInvestmentTransactions();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  const isPl = transaction.type === "pl";
  const isOut = transaction.type === "out";
  const [amountInput, setAmountInput] = useState(
    formatNumberInput(String(Math.abs(transaction.amount))),
  );
  const [isNegative, setIsNegative] = useState(transaction.amount < 0);
  const [date, setDate] = useState(() => new Date(transaction.date));
  const [note, setNote] = useState(transaction.note ?? "");
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deletedSuffix = t("investment.deletedAccountSuffix");
  const sourceLabel = resolveAccountLabel(
    instruments,
    transaction.idInstrument,
    transaction.idInvestmentAccount,
    deletedSuffix,
  );
  const destinationLabel =
    transaction.idInstrumentTo && transaction.idInvestmentAccountTo
      ? resolveAccountLabel(
          instruments,
          transaction.idInstrumentTo,
          transaction.idInvestmentAccountTo,
          deletedSuffix,
        )
      : null;

  function formatDateLabel(value: Date) {
    return new Intl.DateTimeFormat(language, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(value);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const magnitude = parseFormattedNumber(amountInput);
    if (magnitude <= 0) {
      showToast(t("transaction.amountRequiredError"), "error");
      return;
    }
    const amount = isPl && isNegative ? -magnitude : magnitude;

    setIsSubmitting(true);
    try {
      await editInvestmentTransaction(transaction.idInvestmentTransaction, {
        amount,
        date: date.toISOString(),
        ...(isOut && { note: note || undefined }),
      });
      showToast(t("investment.transactionUpdateSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: t("investment.deleteTransactionConfirmTitle"),
      description: t("investment.deleteTransactionConfirmDescription"),
      confirmLabel: t("investment.deleteTransactionConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteInvestmentTransaction(transaction.idInvestmentTransaction);
      showToast(t("investment.transactionDeleteSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
              {t("investment.editTransactionTitle")}
            </Words>
            <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
              {t(`investment.type.${transaction.type}`)} ·{" "}
              {destinationLabel ? `${sourceLabel} → ${destinationLabel}` : sourceLabel}
            </Words>
          </div>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            aria-label={t("investment.deleteButton")}
            title={t("investment.deleteButton")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            {isDeleting ? (
              <IconLoader className="h-4 w-4 animate-spin" />
            ) : (
              <HiOutlineTrash className="h-4 w-4" />
            )}
          </button>
        </div>

        <FormField
          label={isPl ? t("investment.profitLossPreviewLabel") : t("investment.investedAmountLabel")}
          htmlFor="edit-investment-transaction-amount"
        >
          <Input
            id="edit-investment-transaction-amount"
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => setAmountInput(formatNumberInput(event.target.value))}
            placeholder="0"
            startIcon={
              <Words type="sm/bold" as="span" className="text-ink-400 dark:text-ink-500">
                {currencySymbol}
              </Words>
            }
          />
        </FormField>

        {isPl && (
          <label className="flex items-center gap-2">
            <Checkbox
              checked={isNegative}
              onChange={(event) => setIsNegative(event.target.checked)}
            />
            <Words type="sm/bold" as="span" className="text-ink-700 dark:text-ink-300">
              {t("investment.negativeChangeLabel")}
            </Words>
          </label>
        )}

        <button
          type="button"
          onClick={() => setIsDateTimePickerOpen(true)}
          className="flex items-center gap-3 rounded-2xl border border-ink-200 p-3 transition-colors hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800">
            <HiOutlineCalendarDays className="h-4 w-4 text-ink-500 dark:text-ink-400" />
          </div>
          <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
            {formatDateLabel(date)}
          </Words>
        </button>

        {isOut && (
          <FormField label={t("investment.noteLabel")} htmlFor="edit-note">
            <Input
              id="edit-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("investment.notePlaceholder")}
            />
          </FormField>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            <Words type="sm/bold" as="span">
              {t("common.cancel")}
            </Words>
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            <Words type="sm/bold" as="span">
              {t("common.confirm")}
            </Words>
          </Button>
        </div>
      </form>

      <DateTimePickerModal
        isOpen={isDateTimePickerOpen}
        value={date}
        onClose={() => setIsDateTimePickerOpen(false)}
        onConfirm={setDate}
      />
    </>
  );
}
