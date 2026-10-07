import { useTranslation } from "react-i18next";
import { Modal } from "@/components/molecules/Modal";
import { AmountCalculatorKeypad } from "@/components/molecules/AmountCalculatorKeypad";
import { Chip } from "@/components/molecules/Chip";
import { useAmountCalculator } from "@/hooks/use-amount-calculator";
import { useMoneyFormat } from "@/hooks/use-money-format";
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
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={t("transaction.amountTitle")}
      subtitle={t("transaction.amountSubtitle")}
    >
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
  const { symbol } = useMoneyFormat();

  function confirmAndClose(value: number) {
    onConfirm(Math.max(0, value));
    onClose();
  }

  const calc = useAmountCalculator(amount, { onEnter: confirmAndClose });
  const valueLabel = calc.displayValue;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[106px] flex-col items-end justify-end gap-1 rounded-[20px] bg-surface-2 px-5 py-4">
        <p className="h-[18px] w-full truncate text-right text-[13.5px] text-text-3 tabular">
          {calc.hasExpression && (
            <>
              {calc.expressionDisplay}
              <span className="ml-0.5 animate-pulse">|</span>
            </>
          )}
        </p>
        <p className="flex max-w-full items-baseline gap-2">
          <span className="shrink-0 font-display text-[18px] font-medium text-text-3">
            {symbol}
          </span>
          <span
            className={cn(
              "truncate font-num leading-[1.1] font-semibold tracking-[-0.02em] text-text tabular transition-[font-size] duration-200",
              valueLabel.length > 14
                ? "text-[28px]"
                : valueLabel.length > 11
                  ? "text-[34px]"
                  : "text-[42px]",
            )}
          >
            {valueLabel}
          </span>
        </p>
      </div>

      {wallets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="shrink-0 text-[12.5px] text-text-3">
            {t("transaction.fromWalletShort")}
          </span>
          {wallets.map((wallet) => (
            <Chip
              key={wallet.idWallet}
              size="sm"
              variant="outline"
              dot={wallet.color}
              active={selectedWalletId === wallet.idWallet}
              onClick={() => onSelectWallet(wallet.idWallet)}
              className="h-7 max-w-[160px] px-2.5 text-[12px]"
            >
              {wallet.nameWallet}
            </Chip>
          ))}
        </div>
      )}

      <AmountCalculatorKeypad
        onDigit={calc.handleDigit}
        onDecimal={calc.handleDecimal}
        onTripleZero={calc.handleTripleZero}
        onOperator={calc.handleOperator}
        onBackspace={calc.handleBackspace}
        decimalLabel={calc.decimalSeparator}
        confirmLabel={t("transaction.amountDone")}
        onConfirm={() => confirmAndClose(calc.value)}
      />
    </div>
  );
}
