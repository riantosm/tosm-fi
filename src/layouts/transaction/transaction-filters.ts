import type { ComponentType } from "react";
import { LuArrowDownLeft, LuArrowLeftRight, LuArrowUpRight, LuScale } from "react-icons/lu";
import type { DateRangeFilter } from "@/layouts/transaction/DateRangeFields";
import type { TransactionSortOption } from "@/layouts/transaction/TransactionToolbar";
import type {
  TransactionFilterMode,
  TransactionListParams,
  TransactionType,
} from "@/types/transaction.types";
import { formatShortDate, parseIsoDate } from "@/utils/calendar";

export type TransactionTypeFilter = TransactionType | "all";

/** Every Transactions-page filter except the month and the search text. */
export interface TransactionFilters {
  /** Empty = every wallet. */
  walletIds: string[];
  /** Whether `walletIds` are the wallets to show (include) or to hide (exclude). */
  walletMode: TransactionFilterMode;
  type: TransactionTypeFilter;
  /** Empty = every category. */
  categoryIds: string[];
  categoryMode: TransactionFilterMode;
  /** Only applies while exactly one category is included. Empty = every subcategory. */
  subCategoryIds: string[];
  subCategoryMode: TransactionFilterMode;
  range: DateRangeFilter;
  sort: TransactionSortOption;
}

export const EMPTY_RANGE: DateRangeFilter = { from: "", to: "" };

export const DEFAULT_FILTERS: TransactionFilters = {
  walletIds: [],
  walletMode: "include",
  type: "all",
  categoryIds: [],
  categoryMode: "include",
  subCategoryIds: [],
  subCategoryMode: "include",
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
    filters.walletIds.length > 0,
    filters.type !== "all",
    filters.categoryIds.length > 0,
    filters.subCategoryIds.length > 0,
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

/** Adds `id` to the list, or removes it if already there. */
export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

/** The single included category whose subcategories can be filtered, if any. */
export function getSubCategoryParent(filters: TransactionFilters): string | null {
  return filters.categoryMode === "include" && filters.categoryIds.length === 1
    ? filters.categoryIds[0]
    : null;
}

/** Wallet/category/subcategory part of the `GET /transactions` query. */
export function buildIdFilterParams(
  filters: TransactionFilters,
): Pick<
  TransactionListParams,
  "idWallet" | "walletMode" | "idCategory" | "categoryMode" | "idSubCategory" | "subCategoryMode"
> {
  const hasWallets = filters.walletIds.length > 0;
  const hasCategories = filters.categoryIds.length > 0;
  const hasSubCategories =
    getSubCategoryParent(filters) !== null && filters.subCategoryIds.length > 0;
  return {
    idWallet: hasWallets ? filters.walletIds.join(",") : undefined,
    walletMode: hasWallets && filters.walletMode === "exclude" ? "exclude" : undefined,
    idCategory: hasCategories ? filters.categoryIds.join(",") : undefined,
    categoryMode: hasCategories && filters.categoryMode === "exclude" ? "exclude" : undefined,
    idSubCategory: hasSubCategories ? filters.subCategoryIds.join(",") : undefined,
    subCategoryMode:
      hasSubCategories && filters.subCategoryMode === "exclude" ? "exclude" : undefined,
  };
}
