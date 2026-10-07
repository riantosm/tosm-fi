import { LuDelete } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { IconLoader } from "@/components/atoms/IconLoader";
import type { CalculatorOperator } from "@/hooks/use-amount-calculator";
import { cn } from "@/utils/cn";

interface AmountCalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onTripleZero: () => void;
  onOperator: (operator: CalculatorOperator) => void;
  onBackspace: () => void;
  /** When set, the last row becomes [⌫ | confirm] (design V2/Keypad). */
  confirmLabel?: string;
  onConfirm?: () => void;
  isConfirming?: boolean;
  /** Decimal key label — "," for id/jp style locales, "." otherwise. */
  decimalLabel?: string;
}

const ROWS: { keys: string[]; operator: CalculatorOperator; operatorLabel: string }[] = [
  { keys: ["7", "8", "9"], operator: "÷", operatorLabel: "÷" },
  { keys: ["4", "5", "6"], operator: "×", operatorLabel: "×" },
  { keys: ["1", "2", "3"], operator: "-", operatorLabel: "−" },
];

export function AmountCalculatorKeypad({
  onDigit,
  onDecimal,
  onTripleZero,
  onOperator,
  onBackspace,
  confirmLabel,
  onConfirm,
  isConfirming = false,
  decimalLabel = ",",
}: AmountCalculatorKeypadProps) {
  const { t } = useTranslation();
  const hasConfirm = Boolean(confirmLabel && onConfirm);

  return (
    <div className="grid grid-cols-4 gap-2">
      {ROWS.map((row) => [
        ...row.keys.map((key) => (
          <CalcButton key={key} onClick={() => onDigit(key)}>
            {key}
          </CalcButton>
        )),
        <CalcButton key={row.operator} variant="operator" onClick={() => onOperator(row.operator)}>
          {row.operatorLabel}
        </CalcButton>,
      ])}

      <CalcButton onClick={onTripleZero}>000</CalcButton>
      <CalcButton onClick={() => onDigit("0")}>0</CalcButton>
      <CalcButton onClick={onDecimal}>{decimalLabel}</CalcButton>
      <CalcButton variant="operator" onClick={() => onOperator("+")}>
        +
      </CalcButton>

      <button
        type="button"
        onClick={onBackspace}
        aria-label={t("common.backspace")}
        className={cn(
          "pressable flex h-[52px] items-center justify-center rounded-control bg-surface-2 text-text-2 hover:bg-surface-3 hover:text-text sm:h-14",
          hasConfirm ? "col-span-2" : "col-span-4",
        )}
      >
        <LuDelete className="size-5" />
      </button>
      {hasConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming}
          className="pressable col-span-2 flex h-[52px] items-center justify-center gap-2 rounded-control bg-primary text-[14.5px] font-semibold text-primary-fg shadow-[0_6px_18px_color-mix(in_oklab,var(--primary)_30%,transparent)] hover:brightness-[1.06] disabled:opacity-70 sm:h-14"
        >
          {isConfirming && <IconLoader className="size-4 animate-spin" />}
          {confirmLabel}
        </button>
      )}
    </div>
  );
}

interface CalcButtonProps {
  children: string;
  onClick: () => void;
  variant?: "digit" | "operator";
}

function CalcButton({ children, onClick, variant = "digit" }: CalcButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable flex h-[52px] items-center justify-center rounded-control font-num text-[20px] font-medium tabular sm:h-14",
        variant === "operator"
          ? "bg-primary-soft font-semibold text-primary-text hover:bg-[color-mix(in_oklab,var(--primary-soft),var(--primary)_14%)]"
          : "bg-surface-2 text-text hover:bg-surface-3",
      )}
    >
      {children}
    </button>
  );
}
