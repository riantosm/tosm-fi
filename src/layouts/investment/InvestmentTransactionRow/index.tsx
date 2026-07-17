import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowDownCircle,
  HiOutlineArrowsRightLeft,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowUpCircle,
} from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { resolveAccountLabel } from "@/utils/investment";
import { cn } from "@/utils/cn";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface InvestmentTransactionRowProps {
  transaction: InvestmentTransaction;
  instruments: Instrument[];
  onClick: () => void;
}

export function InvestmentTransactionRow({
  transaction,
  instruments,
  onClick,
}: InvestmentTransactionRowProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  const deletedSuffix = t("investment.deletedAccountSuffix");
  const sourceLabel = resolveAccountLabel(
    instruments,
    transaction.idInstrument,
    transaction.idInvestmentAccount,
    deletedSuffix,
  );
  const destinationLabel =
    transaction.idInstrumentTo && transaction.idInvestmentAccountTo
      ? resolveAccountLabel(
          instruments,
          transaction.idInstrumentTo,
          transaction.idInvestmentAccountTo,
          deletedSuffix,
        )
      : null;

  const isPlNegative = transaction.type === "pl" && transaction.amount < 0;
  const isPositive = transaction.type === "in" || (transaction.type === "pl" && !isPlNegative);

  const Icon =
    transaction.type === "in"
      ? HiOutlineArrowDownCircle
      : transaction.type === "out"
        ? HiOutlineArrowUpCircle
        : transaction.type === "transfer"
          ? HiOutlineArrowsRightLeft
          : isPlNegative
            ? HiOutlineArrowTrendingDown
            : HiOutlineArrowTrendingUp;

  const iconColorClass =
    transaction.type === "transfer"
      ? "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
      : isPositive
        ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
        : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400";

  const amountSign =
    transaction.type === "transfer"
      ? ""
      : transaction.type === "out" || transaction.amount < 0
        ? "-"
        : "+";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
          iconColorClass,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
          {destinationLabel ? `${sourceLabel} → ${destinationLabel}` : sourceLabel}
        </Words>
        <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
          {t(`investment.type.${transaction.type}`)}
          {transaction.note && ` · ${transaction.note}`}
        </Words>
      </div>

      <Words
        type="sm/bold"
        as="span"
        className={cn(
          "shrink-0 whitespace-nowrap",
          transaction.type === "transfer"
            ? "text-ink-700 dark:text-ink-300"
            : isPositive
              ? "text-primary-600 dark:text-primary-400"
              : "text-red-500 dark:text-red-400",
        )}
      >
        {amountSign}
        {format(Math.abs(transaction.amount))}
      </Words>
    </button>
  );
}
