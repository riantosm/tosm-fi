import { startOfMonth } from "@/utils/month";
import { toIsoDateString } from "@/utils/report-period";

export type NetWorthPeriodPreset = "month" | "year" | "all";

export interface ResolvedNetWorthPeriod {
  dateFrom: string;
  dateTo: string;
}

/** Mirrors resolveReportPeriod's "month"/"year" calendar-bound convention; "all" spans from the
 * user's first ever investment transaction (or today, if none yet) through today. */
export function resolveNetWorthPeriod(
  preset: NetWorthPeriodPreset,
  referenceDate: Date,
  firstInvestmentDate: string | null,
): ResolvedNetWorthPeriod {
  if (preset === "month") {
    return {
      dateFrom: toIsoDateString(startOfMonth(referenceDate)),
      dateTo: toIsoDateString(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)),
    };
  }
  if (preset === "year") {
    return {
      dateFrom: toIsoDateString(new Date(referenceDate.getFullYear(), 0, 1)),
      dateTo: toIsoDateString(new Date(referenceDate.getFullYear(), 11, 31)),
    };
  }
  return {
    dateFrom: firstInvestmentDate ?? toIsoDateString(referenceDate),
    dateTo: toIsoDateString(referenceDate),
  };
}
