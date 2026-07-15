import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { InvestmentAccountPickerButton } from "@/layouts/investment/InvestmentAccountPickerButton";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import { CURRENCIES } from "@/constants/currencies";

interface TransferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferFormModal({ isOpen, onClose }: TransferFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && <TransferFormFields onClose={onClose} />}
    </Modal>
  );
}

function TransferFormFields({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const currencySymbol = CURRENCIES.find((option) => option.code === currency)?.symbol ?? "IDR";
  const { createTransfer } = useInvestmentTransactions();
  const { showToast } = useToast();

  const [idInstrument, setIdInstrument] = useState<string | null>(null);
  const [idInvestmentAccount, setIdInvestmentAccount] = useState<string | null>(null);
  const [idInstrumentTo, setIdInstrumentTo] = useState<string | null>(null);
  const [idInvestmentAccountTo, setIdInvestmentAccountTo] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = parseFormattedNumber(amountInput);
    if (amount <= 0) {
      showToast(t("transaction.amountRequiredError"), "error");
      return;
    }
    if (!idInstrument || !idInvestmentAccount) {
      showToast(t("investment.selectSourceAccountRequiredError"), "error");
      return;
    }
    if (!idInstrumentTo || !idInvestmentAccountTo) {
      showToast(t("investment.selectDestinationAccountRequiredError"), "error");
      return;
    }
    if (idInvestmentAccount === idInvestmentAccountTo) {
      showToast(t("investment.transferSameAccountError"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransfer({
        idInstrument,
        idInvestmentAccount,
        idInstrumentTo,
        idInvestmentAccountTo,
        amount,
        date: new Date().toISOString(),
      });
      showToast(t("investment.transferSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {t("investment.transferTitle")}
        </Words>
        <ModalCloseButton onClose={onClose} />
      </div>

      <FormField label={t("investment.transferFromLabel")} htmlFor="transfer-from">
        <InvestmentAccountPickerButton
          idInstrument={idInstrument}
          idInvestmentAccount={idInvestmentAccount}
          onChange={(instrument, account) => {
            setIdInstrument(instrument.idInstrument);
            setIdInvestmentAccount(account.idInvestmentAccount);
          }}
        />
      </FormField>

      <FormField label={t("investment.transferToLabel")} htmlFor="transfer-to">
        <InvestmentAccountPickerButton
          idInstrument={idInstrumentTo}
          idInvestmentAccount={idInvestmentAccountTo}
          excludeAccountId={idInvestmentAccount ?? undefined}
          onChange={(instrument, account) => {
            setIdInstrumentTo(instrument.idInstrument);
            setIdInvestmentAccountTo(account.idInvestmentAccount);
          }}
        />
      </FormField>

      <FormField label={t("investment.investedAmountLabel")} htmlFor="transfer-amount">
        <Input
          id="transfer-amount"
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
