import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  CashFlowPoint,
  DashboardSummary,
  MonthlyTrendRawPoint,
  ReportExportFormat,
  ReportSummary,
  TopSpendingItem,
  WalletUsageItem,
} from "@/types/report.types";
import type { ResolvedReportPeriod } from "@/utils/report-period";
import type { TransactionCategoryBreakdown } from "@/types/transaction.types";

export const reportService = {
  // Dedicated backend endpoint: computes the current + previous period aggregates and their
  // comparison server-side, so the summary cards (+ category breakdown) need one round trip
  // instead of composing several /transactions calls.
  async fetchSummary(
    dateFrom: string,
    dateTo: string,
    previousDateFrom: string,
    previousDateTo: string,
  ): Promise<{ summary: ReportSummary; categoryBreakdown: TransactionCategoryBreakdown[] }> {
    try {
      const { data } = await httpClient.get("/reports/summary", {
        params: { dateFrom, dateTo, previousDateFrom, previousDateTo },
      });
      const { categoryBreakdown, ...summary } = data.data;
      return { summary, categoryBreakdown };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("reports.genericError")));
    }
  },

  // Dedicated backend endpoint: buckets by hour/day/week/month server-side (same bucketing
  // rules the client used to run itself) instead of shipping the whole period's transaction
  // list over the wire just to sum it client-side.
  async fetchCashFlow(dateFrom: string, dateTo: string, locale: string): Promise<CashFlowPoint[]> {
    try {
      const { data } = await httpClient.get("/reports/cash-flow", { params: { dateFrom, dateTo, locale } });
      return data.data as CashFlowPoint[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("reports.genericError")));
    }
  },

  // Dedicated backend endpoint: returns both income and expense per month in one call, so
  // toggling the Pengeluaran/Pemasukan metric client-side doesn't need a refetch.
  async fetchMonthlyTrend(monthsCount: number, locale: string): Promise<MonthlyTrendRawPoint[]> {
    try {
      const { data } = await httpClient.get("/reports/monthly-trend", {
        params: { months: monthsCount, locale },
      });
      return data.data as MonthlyTrendRawPoint[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("reports.genericError")));
    }
  },

  // Dedicated backend endpoint: one aggregation over every wallet at once instead of one
  // /transactions call per wallet.
  async fetchWalletUsage(dateFrom: string, dateTo: string): Promise<WalletUsageItem[]> {
    try {
      const { data } = await httpClient.get("/reports/wallet-usage", { params: { dateFrom, dateTo } });
      return data.data as WalletUsageItem[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("reports.genericError")));
    }
  },

  // Dedicated backend endpoint: category/subcategory names are already resolved server-side.
  async fetchTopSpending(dateFrom: string, dateTo: string, limit: number): Promise<TopSpendingItem[]> {
    try {
      const { data } = await httpClient.get("/reports/top-spending", { params: { dateFrom, dateTo, limit } });
      return data.data as TopSpendingItem[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("reports.genericError")));
    }
  },

  // Dedicated backend endpoint: combines wallet totals, investment totals, and this month's
  // income/expense/savings in one call instead of composing three separate requests.
  async fetchDashboardSummary(month?: string): Promise<DashboardSummary> {
    try {
      const { data } = await httpClient.get("/reports/dashboard-summary", {
        params: month ? { month } : undefined,
      });
      return data.data as DashboardSummary;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("dashboard.genericError")));
    }
  },

  exportReport(
    format: Exclude<ReportExportFormat, "print">,
    period: ResolvedReportPeriod,
  ): { fileName: string } {
    const extension = format === "excel" ? "xlsx" : format === "csv" ? "csv" : "pdf";
    return { fileName: `laporan_${period.dateFrom}_${period.dateTo}.${extension}` };
  },
};
