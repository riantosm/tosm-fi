import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/molecules/Modal";
import { AmountCalculatorKeypad } from "@/components/molecules/AmountCalculatorKeypad";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useAmountCalculator } from "@/hooks/use-amount-calculator";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import type { BudgetSlice } from "@/utils/budget-breakdown";

interface SetLimitModalProps {
  isOpen: boolean;
  slice: BudgetSlice | null;
  /** Parent budget, for the "Budget {{name}}" subtitle. */
  budgetName: string;
  onClose: () => void;
  /** 0 clears the limit back to "no limit set". */
  onSubmit: (limitAmount: number) => void;
}

export function SetLimitModal(props: SetLimitModalProps) {
  const session = useDialogSession(props.isOpen);
  return <SetLimitDialog key={session} {...props} />;
}

function SetLimitDialog({
  isOpen,
  slice: sliceProp,
  budgetName,
  onClose,
  onSubmit,
}: SetLimitModalProps) {
  const { t } = useTranslation();
  // Frozen for this dialog's lifetime so the exit animation keeps the same row.
  const [slice] = useState(sliceProp);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={t("budget.setLimitTitle")}
      subtitle={t("budget.inBudget", { name: budgetName })}
    >
      {slice && (
        <SetLimitFields slice={slice} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} />
      )}
    </Modal>
  );
}

interface SetLimitFieldsProps {
  slice: BudgetSlice;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (limitAmount: number) => void;
}

function SetLimitFields({ slice, isOpen, onClose, onSubmit }: SetLimitFieldsProps) {
  const { t } = useTranslation();
  const { symbol, format, formatNumber } = useMoneyFormat();

  function confirmAndClose(value: number) {
    if (!isOpen) return;
    onSubmit(Math.max(0, value));
    onClose();
  }

  const calc = useAmountCalculator(slice.limit ?? 0, { onEnter: confirmAndClose });
  const valueLabel = formatNumber(calc.value);
  const name = slice.name ?? t("dashboard.otherSubCategory");

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-3 rounded-[18px] px-3.5 py-3"
        style={{ backgroundColor: `${slice.color}1F` }}
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface"
          style={{ color: slice.color }}
        >
          {createElement(resolveCategoryIcon(slice.icon), { className: "size-[18px]" })}
        </span>
        <span className="flex min-w-0 flex-col gap-px">
          <span className="truncate text-[14.5px] font-semibold text-text">{name}</span>
          <span className="truncate text-[12.5px] text-text-2">
            {t("budget.spentThisMonth", { amount: format(slice.spent) })}
          </span>
        </span>
      </div>

      <div className="flex min-h-[90px] flex-col items-end justify-end gap-0.5 rounded-[20px] bg-surface-2 px-5 py-3.5">
        <span className="h-4 w-full truncate text-right text-[12.5px] text-text-3 tabular">
          {calc.hasExpression ? (
            <>
              {calc.expressionDisplay}
              <span className="ml-0.5 animate-pulse">|</span>
            </>
          ) : (
            t("budget.limitPerMonth")
          )}
        </span>
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
                  ? "text-[32px]"
                  : "text-[38px]",
            )}
          >
            {valueLabel}
          </span>
        </p>
      </div>

      <AmountCalculatorKeypad
        onDigit={calc.handleDigit}
        onDecimal={calc.handleDecimal}
        onTripleZero={calc.handleTripleZero}
        onOperator={calc.handleOperator}
        onBackspace={calc.handleBackspace}
        decimalLabel={calc.decimalSeparator}
        confirmLabel={t("budget.saveLimit")}
        onConfirm={() => confirmAndClose(calc.value)}
      />
    </div>
  );
}
