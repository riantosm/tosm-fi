import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CategoryBreakdownChart } from "@/components/molecules/CategoryBreakdownChart";
import { isSameMonthAs, startOfMonth } from "@/utils/month";
import type { Category } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";

interface ExpenseByCategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export function ExpenseByCategoryChart({ transactions, categories }: ExpenseByCategoryChartProps) {
  const { t } = useTranslation();

  const currentExpenseTransactions = useMemo(() => {
    const now = startOfMonth(new Date());
    return transactions.filter(
      (transaction) =>
        transaction.type === "expense" && isSameMonthAs(new Date(transaction.date), now),
    );
  }, [transactions]);

  return (
    <CategoryBreakdownChart
      expenseTransactions={currentExpenseTransactions}
      categories={categories}
      title={t("dashboard.expenseByCategory")}
      periodLabel={t("dashboard.thisMonth")}
    />
  );
}
