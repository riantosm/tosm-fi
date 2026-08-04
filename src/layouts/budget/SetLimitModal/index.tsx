import { createElement } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { AmountCalculatorKeypad } from "@/components/molecules/AmountCalculatorKeypad";
import { useAmountCalculator } from "@/hooks/use-amount-calculator";
import { useCurrency } from "@/hooks/use-currency";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { BudgetSlice } from "@/utils/budget-breakdown";

interface SetLimitModalProps {
  isOpen: boolean;
  slice: BudgetSlice | null;
  onClose: () => void;
  onSubmit: (limitAmount: number) => void;
}

export function SetLimitModal({ isOpen, slice, onClose, onSubmit }: SetLimitModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      {isOpen && slice && <SetLimitFields slice={slice} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

interface SetLimitFieldsProps {
  slice: BudgetSlice;
  onClose: () => void;
  onSubmit: (limitAmount: number) => void;
}

function SetLimitFields({ slice, onClose, onSubmit }: SetLimitFieldsProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const Icon = resolveCategoryIcon(slice.icon);

  function confirmAndClose(value: number) {
    onSubmit(Math.max(0, value));
    onClose();
  }

  const calc = useAmountCalculator(slice.limit ?? 0, { onEnter: confirmAndClose });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {t("budget.setLimitTitle")}
        </Words>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-3 dark:bg-ink-800">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${slice.color}26` }}
        >
          {createElement(Icon, { className: "h-4 w-4", style: { color: slice.color } })}
        </div>
        <div className="flex min-w-0 flex-col">
          <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
            {slice.name ?? t("dashboard.otherSubCategory")}
          </Words>
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {t("budget.spentSoFar", { amount: format(slice.spent) })}
          </Words>
        </div>
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

      <AmountCalculatorKeypad
        onDigit={calc.handleDigit}
        onDecimal={calc.handleDecimal}
        onTripleZero={calc.handleTripleZero}
        onOperator={calc.handleOperator}
        onBackspace={calc.handleBackspace}
      />

      <Button onClick={() => confirmAndClose(calc.value)} className="w-full">
        <Words type="sm/bold" as="span">
          {t("budget.setLimitButton")}
        </Words>
      </Button>
    </div>
  );
}
