import { generateShades } from "@/utils/color";
import type { Category } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";

export const OTHER_SUB_CATEGORY_ID = "__other__";

export interface CategorySlice {
  id: string;
  /** `null` means "no subcategory" — render an "Other" label at display time. */
  name: string | null;
  icon: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
  subSlices?: CategorySlice[];
}

function buildSubCategorySlices(expenseTransactions: Transaction[], category: Category): CategorySlice[] {
  const totals = new Map<string, { total: number; count: number }>();
  for (const transaction of expenseTransactions) {
    if (transaction.idCategory !== category.idCategory) continue;
    const key = transaction.idSubCategory ?? OTHER_SUB_CATEGORY_ID;
    const entry = totals.get(key) ?? { total: 0, count: 0 };
    entry.total += Math.abs(transaction.amount);
    entry.count += 1;
    totals.set(key, entry);
  }

  const grandTotal = [...totals.values()].reduce((sum, entry) => sum + entry.total, 0);
  const sortedEntries = [...totals.entries()].sort((a, b) => b[1].total - a[1].total);
  const shades = generateShades(category.color, sortedEntries.length);

  return sortedEntries.map(([idSubCategory, entry], index) => {
    const subCategory = category.subCategories.find((item) => item.idSubCategory === idSubCategory);
    return {
      id: idSubCategory,
      name: subCategory?.nameSubCategory ?? null,
      icon: subCategory?.icon ?? category.icon,
      color: shades[index] ?? category.color,
      total: entry.total,
      count: entry.count,
      percentage: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
    };
  });
}

/** Eagerly nests each category's subcategory breakdown into `subSlices`. */
export function buildCategoryBreakdown(
  expenseTransactions: Transaction[],
  categories: Category[],
): CategorySlice[] {
  const totals = new Map<string, { total: number; count: number }>();
  for (const transaction of expenseTransactions) {
    if (!transaction.idCategory) continue;
    const entry = totals.get(transaction.idCategory) ?? { total: 0, count: 0 };
    entry.total += Math.abs(transaction.amount);
    entry.count += 1;
    totals.set(transaction.idCategory, entry);
  }

  const grandTotal = [...totals.values()].reduce((sum, entry) => sum + entry.total, 0);

  return [...totals.entries()]
    .map(([idCategory, entry]) => {
      const category = categories.find((item) => item.idCategory === idCategory);
      return {
        id: idCategory,
        name: category?.nameCategory ?? "-",
        icon: category?.icon ?? "",
        color: category?.color ?? "#71717a",
        total: entry.total,
        count: entry.count,
        percentage: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
        subSlices: category ? buildSubCategorySlices(expenseTransactions, category) : [],
      };
    })
    .sort((a, b) => b.total - a.total);
}
