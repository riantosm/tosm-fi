import { useMemo } from "react";
import { Words } from "@/components/atoms/Words";
import { InvestmentTransactionRow } from "@/layouts/investment/InvestmentTransactionRow";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface InvestmentTransactionListProps {
  title?: string;
  transactions: InvestmentTransaction[];
  instruments: Instrument[];
  emptyMessage: string;
  onEditTransaction: (transaction: InvestmentTransaction) => void;
}

export function InvestmentTransactionList({
  title,
  transactions,
  instruments,
  emptyMessage,
  onEditTransaction,
}: InvestmentTransactionListProps) {
  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {title}
        </Words>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-10 dark:border-ink-800">
          <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
            {emptyMessage}
          </Words>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-ink-100 dark:divide-ink-800">
          {sorted.map((transaction) => (
            <InvestmentTransactionRow
              key={transaction.idInvestmentTransaction}
              transaction={transaction}
              instruments={instruments}
              onClick={() => onEditTransaction(transaction)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
