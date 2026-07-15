import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import { CURRENCIES } from "@/constants/currencies";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

interface ProfitLossFormModalProps {
  isOpen: boolean;
  instrument: Instrument;
  account: InvestmentAccount;
  onClose: () => void;
}

export function ProfitLossFormModal({
  isOpen,
  instrument,
  account,
  onClose,
}: ProfitLossFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <ProfitLossFormFields instrument={instrument} account={account} onClose={onClose} />
      )}
    </Modal>
  );
}

function ProfitLossFormFields({
  instrument,
  account,
  onClose,
}: {
  instrument: Instrument;
  account: InvestmentAccount;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const currencySymbol = CURRENCIES.find((option) => option.code === currency)?.symbol ?? "IDR";
  const { createProfitLoss } = useInvestmentTransactions();
  const { showToast } = useToast();

  const [newValueInput, setNewValueInput] = useState(
    formatNumberInput(String(account.currentValue)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newValue = parseFormattedNumber(newValueInput);
  const delta = newValue - account.currentValue;
  const isPositive = delta >= 0;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newValue < 0) {
      showToast(t("investment.negativeValueError"), "error");
      return;
    }
    if (newValue === account.currentValue) {
      showToast(t("investment.noOpProfitLossError"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfitLoss({
        idInstrument: instrument.idInstrument,
        idInvestmentAccount: account.idInvestmentAccount,
        newCurrentValue: newValue,
        date: new Date().toISOString(),
      });
      showToast(t("investment.profitLossSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {t("investment.profitLossTitle")}
        </Words>
        <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
          {instrument.nameInstrument} — {account.nameInvestmentAccount} ·{" "}
          {t("investment.investedAmount")}: {format(account.investedAmount)}
        </Words>
      </div>

      <FormField label={t("investment.newCurrentValueLabel")} htmlFor="pl-new-value">
        <Input
          id="pl-new-value"
          type="text"
          inputMode="decimal"
          value={newValueInput}
          onChange={(event) => setNewValueInput(formatNumberInput(event.target.value))}
          placeholder="0"
          startIcon={
            <Words type="sm/bold" as="span" className="text-ink-400 dark:text-ink-500">
              {currencySymbol}
            </Words>
          }
        />
      </FormField>

      {delta !== 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {t("investment.profitLossPreviewLabel")}
          </Words>
          <Words
            type="sm/bold"
            as="span"
            className={
              isPositive
                ? "text-primary-600 dark:text-primary-400"
                : "text-red-500 dark:text-red-400"
            }
          >
            {isPositive ? "+" : ""}
            {format(delta)}
          </Words>
        </div>
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
  );
}
