import { useTranslation } from "react-i18next";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import { AmountCalculatorKeypad } from "@/components/molecules/AmountCalculatorKeypad";
import { useAmountCalculator } from "@/hooks/use-amount-calculator";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface AmountCalculatorModalProps {
  isOpen: boolean;
  amount: number;
  wallets: WalletAccount[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function AmountCalculatorModal({
  isOpen,
  amount,
  wallets,
  selectedWalletId,
  onSelectWallet,
  onClose,
  onConfirm,
}: AmountCalculatorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {isOpen && (
        <AmountCalculatorFields
          amount={amount}
          wallets={wallets}
          selectedWalletId={selectedWalletId}
          onSelectWallet={onSelectWallet}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </Modal>
  );
}

type AmountCalculatorFieldsProps = Omit<AmountCalculatorModalProps, "isOpen">;

function AmountCalculatorFields({
  amount,
  wallets,
  selectedWalletId,
  onSelectWallet,
  onClose,
  onConfirm,
}: AmountCalculatorFieldsProps) {
  const { t } = useTranslation();

  function confirmAndClose(value: number) {
    onConfirm(Math.max(0, value));
    onClose();
  }

  const calc = useAmountCalculator(amount, { onEnter: confirmAndClose });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {t("transaction.enterAmountTitle")}
        </Words>
      </div>

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

      {wallets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {wallets.map((wallet) => (
            <button
              key={wallet.idWallet}
              type="button"
              onClick={() => onSelectWallet(wallet.idWallet)}
              className={cn(
                "rounded-full border-2 px-3 py-1.5 transition-colors",
                selectedWalletId === wallet.idWallet ? "" : "border-ink-200 dark:border-ink-700",
              )}
              style={
                selectedWalletId === wallet.idWallet ? { borderColor: wallet.color } : undefined
              }
            >
              <Words type="xs/bold" as="span" className="text-ink-700 dark:text-ink-300 flex shrink-0 items-center justify-center">
                {wallet.nameWallet}
              </Words>
            </button>
          ))}
        </div>
      )}

      <AmountCalculatorKeypad
        onDigit={calc.handleDigit}
        onDecimal={calc.handleDecimal}
        onTripleZero={calc.handleTripleZero}
        onOperator={calc.handleOperator}
        onBackspace={calc.handleBackspace}
      />

      <Button onClick={() => confirmAndClose(calc.value)} className="w-full">
        <Words type="sm/bold" as="span">
          {t("transaction.setAmount")}
        </Words>
      </Button>
    </div>
  );
}
