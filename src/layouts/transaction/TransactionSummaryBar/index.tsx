import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";

interface TransactionSummaryBarProps {
  expense: number;
  income: number;
}

export function TransactionSummaryBar({ expense, income }: TransactionSummaryBarProps) {
  const { format } = useCurrency();
  const net = income - expense;

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-ink-100 px-4 py-3 dark:bg-ink-900">
      <Words type="sm/bold" as="span" className="whitespace-nowrap text-red-500 dark:text-red-400">
        ▼ {format(expense)}
      </Words>
      <Words
        type="sm/bold"
        as="span"
        className="whitespace-nowrap text-primary-600 dark:text-primary-400"
      >
        ▲ {format(income)}
      </Words>
      <Words type="sm/bold" as="span" className="whitespace-nowrap text-ink-900 dark:text-ink-50">
        = {format(net)}
      </Words>
    </div>
  );
}
