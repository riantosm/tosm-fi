import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CategoryBreakdownChart } from "@/components/molecules/CategoryBreakdownChart";
import { ROUTES } from "@/constants/routes";
import { buildCategoryBreakdown, type CategorySlice } from "@/utils/category-breakdown";
import type { TransactionSummary } from "@/types/transaction.types";

interface ExpenseByCategoryChartProps {
  summary: TransactionSummary | null;
  isLoading: boolean;
}

export function ExpenseByCategoryChart({ summary, isLoading }: ExpenseByCategoryChartProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const slices = useMemo(
    () => (summary ? buildCategoryBreakdown(summary.categoryBreakdown) : []),
    [summary],
  );

  function handleSelectSubCategory(subSlice: CategorySlice, categorySlice: CategorySlice) {
    navigate(ROUTES.TRANSACTIONS, {
      state: {
        typeFilter: "expense",
        categoryFilter: categorySlice.id,
        subCategoryFilter: subSlice.id,
      },
    });
  }

  function handleSelectCategory(categorySlice: CategorySlice) {
    navigate(ROUTES.TRANSACTIONS, {
      state: { typeFilter: "expense", categoryFilter: categorySlice.id },
    });
  }

  return (
    <CategoryBreakdownChart
      slices={slices}
      title={t("dashboard.expenseByCategory")}
      periodLabel={t("dashboard.thisMonth")}
      actionLabel={t("dashboard.reportsLink")}
      onAction={() => navigate(ROUTES.REPORTS)}
      onSelectSubCategory={handleSelectSubCategory}
      onSelectCategory={handleSelectCategory}
      isLoading={isLoading}
    />
  );
}
