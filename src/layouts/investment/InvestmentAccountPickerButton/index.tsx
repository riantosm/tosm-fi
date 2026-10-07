import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown, LuTrendingUp } from "react-icons/lu";
import { Monogram } from "@/components/atoms/Monogram";
import { InvestmentTargetModal } from "@/layouts/investment/InvestmentTargetModal";
import { useInstruments } from "@/hooks/use-instruments";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";
import { cn } from "@/utils/cn";

interface InvestmentAccountPickerButtonProps {
  idInstrument: string | null;
  idInvestmentAccount: string | null;
  excludeAccountId?: string;
  disabled?: boolean;
  onChange: (instrument: Instrument, account: InvestmentAccount) => void;
}

/** Field-style trigger showing the chosen "Instrumen · Akun"; opens the combined picker. */
export function InvestmentAccountPickerButton({
  idInstrument,
  idInvestmentAccount,
  excludeAccountId,
  disabled,
  onChange,
}: InvestmentAccountPickerButtonProps) {
  const { t } = useTranslation();
  const { instruments, status, loadInstruments } = useInstruments();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (status === "idle") void loadInstruments();
  }, [status, loadInstruments]);

  const selectedInstrument = instruments.find((item) => item.idInstrument === idInstrument) ?? null;
  const selectedAccount =
    selectedInstrument?.investmentAccounts.find(
      (account) => account.idInvestmentAccount === idInvestmentAccount,
    ) ?? null;
  const hasSelection = Boolean(selectedInstrument && selectedAccount);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsPickerOpen(true)}
        className="group flex h-12 w-full items-center gap-2.5 rounded-control bg-surface-2 px-3 text-left transition-colors duration-200 hover:bg-surface-3 disabled:opacity-60"
      >
        {selectedInstrument && hasSelection ? (
          <Monogram
            name={selectedInstrument.nameInstrument}
            color={selectedInstrument.color}
            size="sm"
          />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-investment-soft text-investment-text">
            <LuTrendingUp className="size-4" />
          </span>
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[14px]",
            hasSelection ? "text-text" : "text-text-3",
          )}
        >
          {hasSelection
            ? `${selectedInstrument?.nameInstrument} · ${selectedAccount?.nameInvestmentAccount}`
            : t("investment.selectAccountPlaceholder")}
        </span>
        <LuChevronDown className="size-[18px] shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-y-px" />
      </button>

      <InvestmentTargetModal
        isOpen={isPickerOpen}
        idInstrument={idInstrument}
        idInvestmentAccount={idInvestmentAccount}
        excludeAccountId={excludeAccountId}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={onChange}
      />
    </>
  );
}
