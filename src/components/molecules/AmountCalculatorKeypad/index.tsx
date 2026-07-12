import { HiOutlineBackspace } from "react-icons/hi2";
import type { CalculatorOperator } from "@/hooks/use-amount-calculator";
import { cn } from "@/utils/cn";

interface AmountCalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onTripleZero: () => void;
  onOperator: (operator: CalculatorOperator) => void;
  onBackspace: () => void;
}

export function AmountCalculatorKeypad({
  onDigit,
  onDecimal,
  onTripleZero,
  onOperator,
  onBackspace,
}: AmountCalculatorKeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {(["1", "2", "3"] as const).map((key) => (
        <CalcButton key={key} onClick={() => onDigit(key)}>
          {key}
        </CalcButton>
      ))}
      <CalcButton variant="operator" onClick={() => onOperator("÷")}>
        ÷
      </CalcButton>

      {(["4", "5", "6"] as const).map((key) => (
        <CalcButton key={key} onClick={() => onDigit(key)}>
          {key}
        </CalcButton>
      ))}
      <CalcButton variant="operator" onClick={() => onOperator("×")}>
        ×
      </CalcButton>

      {(["7", "8", "9"] as const).map((key) => (
        <CalcButton key={key} onClick={() => onDigit(key)}>
          {key}
        </CalcButton>
      ))}
      <CalcButton variant="operator" onClick={() => onOperator("-")}>
        −
      </CalcButton>

      <CalcButton onClick={onDecimal}>.</CalcButton>
      <CalcButton onClick={() => onDigit("0")}>0</CalcButton>
      <CalcButton onClick={onTripleZero}>000</CalcButton>
      <CalcButton variant="operator" onClick={() => onOperator("+")}>
        +
      </CalcButton>

      <button
        type="button"
        onClick={onBackspace}
        className="col-span-4 flex h-11 items-center justify-center rounded-xl bg-ink-100 text-ink-500 transition-colors hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700"
      >
        <HiOutlineBackspace className="h-5 w-5" />
      </button>
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
        "flex h-11 items-center justify-center rounded-xl text-base font-bold transition-colors",
        variant === "operator"
          ? "bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20"
          : "bg-ink-100 text-ink-900 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700",
      )}
    >
      {children}
    </button>
  );
}
