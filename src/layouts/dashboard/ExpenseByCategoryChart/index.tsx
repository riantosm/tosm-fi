import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CategoryBreakdownChart } from "@/components/molecules/CategoryBreakdownChart";
import { OTHER_SUB_CATEGORY_ID, type CategorySlice } from "@/utils/category-breakdown";
import { generateShades } from "@/utils/color";
import type { TransactionSummary } from "@/types/transaction.types";

interface ExpenseByCategoryChartProps {
  summary: TransactionSummary | null;
  isLoading: boolean;
}

function mapSummaryToSlices(summary: TransactionSummary): CategorySlice[] {
  return summary.categoryBreakdown.map((category): CategorySlice => {
    const shades = generateShades(category.color, category.subCategoryBreakdown.length);
    return {
      id: category.idCategory,
      name: category.nameCategory,
      icon: category.icon,
      color: category.color,
      total: category.amount,
      count: category.transactionCount,
      percentage: category.percentage,
      subSlices: category.subCategoryBreakdown.map((sub, index) => ({
        id: sub.idSubCategory ?? OTHER_SUB_CATEGORY_ID,
        name: sub.nameSubCategory,
        icon: sub.icon ?? category.icon,
        color: shades[index] ?? category.color,
        total: sub.amount,
        count: sub.transactionCount,
        percentage: sub.percentage,
      })),
    };
  });
}

export function ExpenseByCategoryChart({ summary, isLoading }: ExpenseByCategoryChartProps) {
  const { t } = useTranslation();

  const slices = useMemo(() => (summary ? mapSummaryToSlices(summary) : []), [summary]);

  return (
    <CategoryBreakdownChart
      slices={slices}
      title={t("dashboard.expenseByCategory")}
      periodLabel={t("dashboard.thisMonth")}
      isLoading={isLoading}
    />
  );
}
