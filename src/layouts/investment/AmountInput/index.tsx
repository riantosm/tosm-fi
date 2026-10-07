import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuBanknote, LuCalculator } from "react-icons/lu";
import { Input } from "@/components/atoms/Input";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";

interface AmountInputProps {
  id: string;
  /** Formatted text ("1.000.000"). */
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  hasError?: boolean;
}

/** Money text field (banknote icon) with a calculator button that opens the shared keypad. */
export function AmountInput({ id, value, onChange, autoFocus, hasError }: AmountInputProps) {
  const { t } = useTranslation();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(formatNumberInput(event.target.value))}
        placeholder="0"
        startIcon={<LuBanknote />}
        className="font-num tabular"
        autoFocus={autoFocus}
        hasError={hasError}
        endSlot={
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            aria-label={t("transaction.amountTitle")}
            className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-surface-3 hover:text-text"
          >
            <LuCalculator className="size-[18px]" />
          </button>
        }
      />
      <AmountCalculatorModal
        isOpen={isCalculatorOpen}
        amount={parseFormattedNumber(value)}
        wallets={[]}
        selectedWalletId={null}
        onSelectWallet={() => {}}
        onClose={() => setIsCalculatorOpen(false)}
        onConfirm={(amount) => onChange(formatNumberInput(String(amount).replace(".", ",")))}
      />
    </>
  );
}
