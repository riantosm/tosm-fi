import { IconArrowDownRight, IconArrowUpRight } from "@/components/atoms/Icons";
import { Words } from "@/components/atoms/Words";
import type { Transaction } from "@/types/dashboard.types";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/utils/cn";

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { format } = useCurrency();
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            isIncome
              ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
              : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
          )}
        >
          {isIncome ? (
            <IconArrowUpRight className="h-4 w-4" />
          ) : (
            <IconArrowDownRight className="h-4 w-4" />
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-100">
            {transaction.title}
          </Words>
          <Words type="xs/regular" className="truncate text-ink-500 dark:text-ink-400">
            {transaction.category} ·{" "}
            {new Date(transaction.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </Words>
        </div>
      </div>
      <Words
        type="sm/bold"
        as="span"
        className={cn(
          "shrink-0 whitespace-nowrap",
          isIncome ? "text-primary-700 dark:text-primary-400" : "text-ink-900 dark:text-ink-100",
        )}
      >
        {isIncome ? "+" : "-"} {format(transaction.amount)}
      </Words>
    </div>
  );
}
