import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";

// Mirrors the subset of TransactionListParams that a "view" (TransactionsPage's
// active filters, DashboardPage's current month) can apply — a pending
// occurrence merged into a transaction list should only show up where a real
// transaction with the same date/type/wallet/category/title would.
export interface OccurrenceViewFilter {
  month?: string; // "YYYY-MM"
  dateFrom?: string; // "YYYY-MM-DD"
  dateTo?: string; // "YYYY-MM-DD"
  type?: string;
  idWallet?: string; // one id or a comma-separated list
  walletMode?: "include" | "exclude";
  idCategory?: string; // one id or a comma-separated list
  categoryMode?: "include" | "exclude";
  idSubCategory?: string; // one id or a comma-separated list
  subCategoryMode?: "include" | "exclude";
  search?: string;
}

// Same semantics as the backend's list filter: include keeps only ids in the
// list, exclude drops them (and keeps a null id, like Mongo's $nin).
function matchesIdList(
  id: string | null,
  list: string | undefined,
  mode: "include" | "exclude" = "include",
): boolean {
  if (!list) return true;
  const isListed = id !== null && list.split(",").includes(id);
  return mode === "exclude" ? !isListed : isListed;
}

export function filterOccurrencesForView(
  occurrences: ScheduleOccurrence[],
  filter: OccurrenceViewFilter,
): ScheduleOccurrence[] {
  return occurrences.filter((occurrence) => {
    // dueDate is always a UTC-midnight "calendar day" value (generated from a
    // date-only picker), so slicing the ISO string directly gives the
    // intended day without any timezone conversion.
    const dueDateKey = occurrence.dueDate.slice(0, 10);

    if (filter.month && !dueDateKey.startsWith(filter.month)) return false;
    if (filter.dateFrom && dueDateKey < filter.dateFrom) return false;
    if (filter.dateTo && dueDateKey > filter.dateTo) return false;
    if (filter.type && occurrence.type !== filter.type) return false;
    if (!matchesIdList(occurrence.idWallet, filter.idWallet, filter.walletMode)) return false;
    if (!matchesIdList(occurrence.idCategory, filter.idCategory, filter.categoryMode)) return false;
    if (!matchesIdList(occurrence.idSubCategory, filter.idSubCategory, filter.subCategoryMode)) {
      return false;
    }
    if (filter.search && !occurrence.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    return true;
  });
}
