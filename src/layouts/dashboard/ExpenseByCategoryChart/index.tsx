import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CategoryBreakdownChart } from "@/components/molecules/CategoryBreakdownChart";
import { buildCategoryBreakdown } from "@/utils/category-breakdown";
import type { TransactionSummary } from "@/types/transaction.types";

interface ExpenseByCategoryChartProps {
  summary: TransactionSummary | null;
  isLoading: boolean;
}

export function ExpenseByCategoryChart({ summary, isLoading }: ExpenseByCategoryChartProps) {
  const { t } = useTranslation();

  const slices = useMemo(
    () => (summary ? buildCategoryBreakdown(summary.categoryBreakdown) : []),
    [summary],
  );

  return (
    <CategoryBreakdownChart
      slices={slices}
      title={t("dashboard.expenseByCategory")}
      periodLabel={t("dashboard.thisMonth")}
      isLoading={isLoading}
    />
  );
}
