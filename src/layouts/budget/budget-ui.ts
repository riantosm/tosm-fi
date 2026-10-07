import { useMemo } from "react";
import type { TFunction } from "i18next";
import type { IconType } from "react-icons";
import { LuLayers, LuShapes } from "react-icons/lu";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useLanguage } from "@/hooks/use-language";
import { formatDayMonth, formatMonthName, formatMonthYear, parseIsoDate } from "@/utils/calendar";
import { getCurrentMonthRange, type CurrentMonthRange } from "@/utils/budget-breakdown";
import { toIntlLocale } from "@/utils/locale";
import type { Budget } from "@/types/budget.types";
import type { Category } from "@/types/category.types";

export interface BudgetPeriod extends CurrentMonthRange {
  locale: string;
  /** "Oktober 2026" */
  monthLabel: string;
  /** "Oktober" */
  monthName: string;
  /** "1 Okt" / "31 Okt" under the progress bars. */
  startLabel: string;
  endLabel: string;
}

/** The current month every budget is measured against, with its display labels. */
export function useBudgetPeriod(): BudgetPeriod {
  const { language } = useLanguage();
  const locale = toIntlLocale(language);

  return useMemo(() => {
    const range = getCurrentMonthRange();
    const start = parseIsoDate(range.dateFrom);
    return {
      ...range,
      locale,
      monthLabel: formatMonthYear(start, locale),
      monthName: formatMonthName(start, locale),
      startLabel: formatDayMonth(start, locale),
      endLabel: formatDayMonth(parseIsoDate(range.dateTo), locale),
    };
  }, [locale]);
}

/** All categories → layers; one category → that category's icon; several → shapes. */
export function resolveBudgetIcon(budget: Budget, categories: Category[]): IconType {
  const ids = budget.idCategories ?? [];
  if (ids.length === 0) return LuLayers;
  if (ids.length === 1) {
    const category = categories.find((item) => item.idCategory === ids[0]);
    if (category) return resolveCategoryIcon(category.icon);
  }
  return LuShapes;
}

/** "Semua kategori" / "2 kategori" — `long` spells out "pengeluaran" for the detail hero. */
export function budgetScopeLabel(budget: Budget, t: TFunction, long = false): string {
  const count = budget.idCategories?.length ?? 0;
  if (count === 0) return long ? t("budget.scopeAllLong") : t("budget.scopeAll");
  return t("budget.categoryCount", { count });
}
