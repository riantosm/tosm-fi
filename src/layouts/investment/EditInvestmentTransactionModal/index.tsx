import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  LuArrowDownLeft,
  LuArrowLeftRight,
  LuArrowUpRight,
  LuCheck,
  LuNotebookPen,
  LuTrash2,
  LuTrendingUpDown,
} from "react-icons/lu";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { AmountInput } from "@/layouts/investment/AmountInput";
import { InvestmentDateTimeField } from "@/layouts/investment/InvestmentDateTimeField";
import { useInvestmentLabels } from "@/layouts/investment/use-investment-labels";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useToast } from "@/hooks/use-toast";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface EditInvestmentTransactionModalProps {
  isOpen: boolean;
  transaction: InvestmentTransaction | null;
  instruments: Instrument[];
  onClose: () => void;
}

const FORM_ID = "edit-investment-transaction-form";

const TYPE_BADGE = {
  in: { tone: "income", icon: <LuArrowDownLeft /> },
  out: { tone: "expense", icon: <LuArrowUpRight /> },
  transfer: { tone: "primary", icon: <LuArrowLeftRight /> },
  pl: { tone: "investment", icon: <LuTrendingUpDown /> },
} as const;

export function EditInvestmentTransactionModal(props: EditInvestmentTransactionModalProps) {
  const session = useDialogSession(props.isOpen);
  return <EditInvestmentTransactionDialog key={session} {...props} />;
}

function EditInvestmentTransactionDialog({
  isOpen,
  transaction: transactionProp,
  instruments,
  onClose,
}: EditInvestmentTransactionModalProps) {
  const { t } = useTranslation();
  const { editInvestmentTransaction, deleteInvestmentTransaction } = useInvestmentTransactions();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();
  const resolveLabels = useInvestmentLabels(instruments);

  // Frozen for this dialog's lifetime so the exit animation keeps the same entry.
  const [transaction] = useState(transactionProp);
  const isPl = transaction?.type === "pl";
  const isOut = transaction?.type === "out";
  const [amountInput, setAmountInput] = useState(
    transaction ? formatNumberInput(String(Math.abs(transaction.amount)).replace(".", ",")) : "",
  );
  const [isNegative, setIsNegative] = useState((transaction?.amount ?? 0) < 0);
  const [date, setDate] = useState(() => (transaction ? new Date(transaction.date) : new Date()));
  const [note, setNote] = useState(transaction?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBusy = isSubmitting || isDeleting;

  const source = transaction
    ? resolveLabels(transaction.idInstrument, transaction.idInvestmentAccount)
    : null;
  const destination = transaction?.idInstrumentTo
    ? resolveLabels(transaction.idInstrumentTo, transaction.idInvestmentAccountTo)
    : null;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transaction) return;
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
    if (!transaction) return;
    const confirmed = await confirm({
      title: t("investment.deleteTransactionConfirmTitle"),
      description: t("investment.deleteTransactionConfirmDescription"),
      confirmLabel: t("investment.deleteTransactionConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
      icon: LuTrash2,
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

  const badge = transaction ? TYPE_BADGE[transaction.type] : null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title={t("investment.editTransactionTitle")}
        subtitle={
          source &&
          (destination
            ? `${source.accountName ?? "-"} → ${destination.accountName ?? "-"}`
            : `${source.accountName ?? "-"} · ${source.instrumentName}`)
        }
        footer={
          <div className="flex items-center gap-2.5">
            <IconButton
              label={t("investment.deleteButton")}
              icon={<LuTrash2 />}
              variant="danger"
              size="lg"
              className="size-[50px]"
              onClick={() => void handleDelete()}
              disabled={isBusy}
            />
            <ModalActions className="flex-1">
              <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                form={FORM_ID}
                leftIcon={<LuCheck />}
                isLoading={isSubmitting}
                disabled={isBusy}
              >
                {t("investment.save")}
              </Button>
            </ModalActions>
          </div>
        }
      >
        {transaction && badge && (
          <form
            id={FORM_ID}
            onSubmit={(event) => void handleSubmit(event)}
            className="flex flex-col gap-[18px]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={badge.tone} icon={badge.icon}>
                {t(`investment.typeFilter.${transaction.type}`)}
              </Badge>
              {destination && (
                <span className="text-[12.5px] text-text-3">
                  {t("investment.row.from", { account: source?.accountName ?? "-" })}
                </span>
              )}
            </div>

            <FormField
              label={isPl ? t("investment.profitLossPreviewLabel") : t("investment.amountLabel")}
              htmlFor="edit-investment-amount"
            >
              <AmountInput
                id="edit-investment-amount"
                value={amountInput}
                onChange={setAmountInput}
              />
            </FormField>

            {isPl && (
              <label className="flex cursor-pointer items-center gap-3 rounded-control bg-surface-2 px-3.5 py-3">
                <Checkbox
                  checked={isNegative}
                  onChange={(event) => setIsNegative(event.target.checked)}
                />
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="text-[14px] font-semibold text-text">
                    {t("investment.negativeChangeLabel")}
                  </span>
                  <span className="text-[12.5px] text-text-2">
                    {t("investment.negativeChangeHint")}
                  </span>
                </span>
              </label>
            )}

            <InvestmentDateTimeField id="edit-investment" value={date} onChange={setDate} />

            {isOut && (
              <FormField label={t("investment.noteLabel")} htmlFor="edit-investment-note">
                <Input
                  id="edit-investment-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t("investment.notePlaceholder")}
                  startIcon={<LuNotebookPen />}
                />
              </FormField>
            )}
          </form>
        )}
      </Modal>

    </>
  );
}
