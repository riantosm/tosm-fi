import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Words } from "@/components/atoms/Words";
import { SelectInstrumentModal } from "@/layouts/investment/SelectInstrumentModal";
import { SelectInvestmentAccountModal } from "@/layouts/investment/SelectInvestmentAccountModal";
import { useInstruments } from "@/hooks/use-instruments";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

interface InvestmentAccountPickerButtonProps {
  idInstrument: string | null;
  idInvestmentAccount: string | null;
  excludeAccountId?: string;
  disabled?: boolean;
  onChange: (instrument: Instrument, account: InvestmentAccount) => void;
}

export function InvestmentAccountPickerButton({
  idInstrument,
  idInvestmentAccount,
  excludeAccountId,
  disabled,
  onChange,
}: InvestmentAccountPickerButtonProps) {
  const { t } = useTranslation();
  const { instruments, status, loadInstruments } = useInstruments();
  const [isInstrumentPickerOpen, setIsInstrumentPickerOpen] = useState(false);
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
  const [pendingInstrument, setPendingInstrument] = useState<Instrument | null>(null);

  useEffect(() => {
    if (status === "idle") void loadInstruments();
  }, [status, loadInstruments]);

  const selectedInstrument = instruments.find((item) => item.idInstrument === idInstrument) ?? null;
  const selectedAccount =
    selectedInstrument?.investmentAccounts.find(
      (account) => account.idInvestmentAccount === idInvestmentAccount,
    ) ?? null;

  function handleInstrumentSelect(instrument: Instrument) {
    setPendingInstrument(instrument);
    setIsInstrumentPickerOpen(false);
    setIsAccountPickerOpen(true);
  }

  function handleAccountSelect(account: InvestmentAccount) {
    if (pendingInstrument) onChange(pendingInstrument, account);
    setIsAccountPickerOpen(false);
    setPendingInstrument(null);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsInstrumentPickerOpen(true)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:bg-ink-50 disabled:opacity-60 dark:border-ink-700 dark:bg-ink-900 dark:hover:bg-ink-800"
      >
        <Words
          type="sm/regular"
          className={
            selectedInstrument && selectedAccount
              ? "text-ink-900 dark:text-ink-50"
              : "text-ink-400 dark:text-ink-500"
          }
        >
          {selectedInstrument && selectedAccount
            ? `${selectedInstrument.nameInstrument} — ${selectedAccount.nameInvestmentAccount}`
            : t("investment.selectAccountPlaceholder")}
        </Words>
      </button>

      <SelectInstrumentModal
        isOpen={isInstrumentPickerOpen}
        onClose={() => setIsInstrumentPickerOpen(false)}
        onSelect={handleInstrumentSelect}
      />
      <SelectInvestmentAccountModal
        isOpen={isAccountPickerOpen}
        instrument={pendingInstrument}
        excludeAccountId={excludeAccountId}
        onClose={() => setIsAccountPickerOpen(false)}
        onSelect={handleAccountSelect}
      />
    </>
  );
}
