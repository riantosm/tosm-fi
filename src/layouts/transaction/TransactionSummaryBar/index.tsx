import { Words } from "@/components/atoms/Words";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/hooks/use-currency";
import { useNavigate } from "react-router-dom";

interface TransactionSummaryBarProps {
  expense: number;
  income: number;
}

export function TransactionSummaryBar({ expense, income }: TransactionSummaryBarProps) {
  const { format } = useCurrency();
  const net = income - expense;
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(ROUTES.REPORTS)}
      className="grid grid-cols-3 gap-2 rounded-2xl bg-ink-100 px-4 py-3 dark:bg-ink-900"
    >
      <Words
        type="sm/bold"
        as="span"
        className="whitespace-nowrap text-red-500 dark:text-red-400 text-left"
      >
        ▼ {format(expense)}
      </Words>
      <Words
        type="sm/bold"
        as="span"
        className="whitespace-nowrap text-primary-600 dark:text-primary-400 text-center"
      >
        ▲ {format(income)}
      </Words>
      <Words
        type="sm/bold"
        as="span"
        className="whitespace-nowrap text-ink-900 dark:text-ink-50 text-right"
      >
        = {format(net)}
      </Words>
    </button>
  );
}
