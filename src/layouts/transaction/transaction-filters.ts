import type { ComponentType } from "react";
import { LuArrowDownLeft, LuArrowLeftRight, LuArrowUpRight, LuScale } from "react-icons/lu";
import type { DateRangeFilter } from "@/layouts/transaction/DateRangeFields";
import type { TransactionSortOption } from "@/layouts/transaction/TransactionToolbar";
import type { TransactionType } from "@/types/transaction.types";
import { formatShortDate, parseIsoDate } from "@/utils/calendar";

export type TransactionTypeFilter = TransactionType | "all";

/** Every Transactions-page filter except the month and the search text. */
export interface TransactionFilters {
  walletId: string;
  type: TransactionTypeFilter;
  categoryId: string;
  subCategoryId: string;
  range: DateRangeFilter;
  sort: TransactionSortOption;
}

export const EMPTY_RANGE: DateRangeFilter = { from: "", to: "" };

export const DEFAULT_FILTERS: TransactionFilters = {
  walletId: "all",
  type: "all",
  categoryId: "all",
  subCategoryId: "all",
  range: EMPTY_RANGE,
  sort: "dateDesc",
};

type IconComponent = ComponentType<{ className?: string }>;

export const TYPE_FILTERS: {
  value: Exclude<TransactionTypeFilter, "all">;
  labelKey: string;
  icon: IconComponent;
}[] = [
  { value: "expense", labelKey: "transaction.expense", icon: LuArrowUpRight },
  { value: "income", labelKey: "transaction.income", icon: LuArrowDownLeft },
  { value: "transfer", labelKey: "transaction.transfer", icon: LuArrowLeftRight },
  { value: "correction", labelKey: "transaction.balanceCorrection", icon: LuScale },
];

/** How many sheet settings differ from the defaults (the Filter button's badge). */
export function countActiveFilters(filters: TransactionFilters): number {
  return [
    filters.walletId !== "all",
    filters.type !== "all",
    filters.categoryId !== "all",
    filters.subCategoryId !== "all",
    Boolean(filters.range.from),
    filters.sort !== DEFAULT_FILTERS.sort,
  ].filter(Boolean).length;
}

export function formatRangeLabel(range: DateRangeFilter, locale: string): string {
  if (!range.from) return "";
  const from = formatShortDate(parseIsoDate(range.from), locale);
  if (!range.to || range.to === range.from) return from;
  return `${from} – ${formatShortDate(parseIsoDate(range.to), locale)}`;
}
