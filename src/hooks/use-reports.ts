import { useCallback, useEffect, useMemo, useState } from "react";
import { reportService } from "@/services/report.service";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { useCategories } from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { resolveReportPeriod } from "@/utils/report-period";
import type { Transaction, TransactionCategoryBreakdown } from "@/types/transaction.types";
import type {
  CashFlowPoint,
  MonthlyTrendMetric,
  MonthlyTrendPoint,
  MonthlyTrendRawPoint,
  ReportExportFormat,
  ReportPeriodFilter,
  ReportSummary,
  TopSpendingItem,
  WalletUsageItem,
} from "@/types/report.types";

const TOP_SPENDING_LIMIT = 10;
const MONTHLY_TREND_MONTHS = 12;

type ReportStatus = "idle" | "loading" | "loaded";

export function useReports(period: ReportPeriodFilter, monthlyTrendMetric: MonthlyTrendMetric) {
  const { queryTransactions } = useTransactions();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { language } = useLanguage();

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<TransactionCategoryBreakdown[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowPoint[]>([]);
  const [monthlyTrendRaw, setMonthlyTrendRaw] = useState<MonthlyTrendRawPoint[]>([]);
  const [walletUsage, setWalletUsage] = useState<WalletUsageItem[]>([]);
  const [topSpending, setTopSpending] = useState<TopSpendingItem[]>([]);
  const [periodTransactions, setPeriodTransactions] = useState<Transaction[]>([]);
  const [completedKey, setCompletedKey] = useState<string | null>(null);

  const resolvedPeriod = useMemo(
    () =>
      resolveReportPeriod(period.preset, new Date(), {
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
      }),
    [period.preset, period.dateFrom, period.dateTo],
  );

  // Only raw transaction fetch left on this page — scoped tightly to the resolved period.
  // Feeds only the export's transaction-list section now (cash flow moved to its own endpoint).
  useEffect(() => {
    let cancelled = false;

    void queryTransactions({ dateFrom: resolvedPeriod.dateFrom, dateTo: resolvedPeriod.dateTo }).then((result) => {
      if (cancelled) return;
      setPeriodTransactions(result.transactions);
    });

    return () => {
      cancelled = true;
    };
  }, [resolvedPeriod.dateFrom, resolvedPeriod.dateTo, queryTransactions]);

  const incomeExpenseTransactions = useMemo(
    () =>
      periodTransactions.filter(
        (transaction) => transaction.type === "income" || transaction.type === "expense",
      ),
    [periodTransactions],
  );

  // monthlyTrendRaw carries both metrics, so switching the Pengeluaran/Pemasukan toggle never
  // needs a refetch — just picks which field to plot.
  const monthlyTrend: MonthlyTrendPoint[] = useMemo(
    () =>
      monthlyTrendRaw.map((point) => ({
        label: point.label,
        value: monthlyTrendMetric === "income" ? point.income : point.expense,
      })),
    [monthlyTrendRaw, monthlyTrendMetric],
  );

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  const requestKey = JSON.stringify({ resolvedPeriod, language });
  const status: ReportStatus = completedKey === requestKey ? "loaded" : "loading";

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      reportService.fetchSummary(
        resolvedPeriod.dateFrom,
        resolvedPeriod.dateTo,
        resolvedPeriod.previousDateFrom,
        resolvedPeriod.previousDateTo,
      ),
      reportService.fetchCashFlow(resolvedPeriod.dateFrom, resolvedPeriod.dateTo, language),
      reportService.fetchMonthlyTrend(MONTHLY_TREND_MONTHS, language),
      reportService.fetchWalletUsage(resolvedPeriod.dateFrom, resolvedPeriod.dateTo),
      reportService.fetchTopSpending(resolvedPeriod.dateFrom, resolvedPeriod.dateTo, TOP_SPENDING_LIMIT),
    ]).then(([summaryResult, cashFlowResult, monthlyTrendResult, walletUsageResult, topSpendingResult]) => {
      if (cancelled) return;
      setSummary(summaryResult.summary);
      setCategoryBreakdown(summaryResult.categoryBreakdown);
      setCashFlow(cashFlowResult);
      setMonthlyTrendRaw(monthlyTrendResult);
      setWalletUsage(walletUsageResult);
      setTopSpending(topSpendingResult);
      setCompletedKey(requestKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPeriod, language]);

  const exportReport = useCallback(
    (format: Exclude<ReportExportFormat, "print">) => reportService.exportReport(format, resolvedPeriod),
    [resolvedPeriod],
  );

  return {
    resolvedPeriod,
    summary,
    cashFlow,
    categoryBreakdown,
    monthlyTrend,
    walletUsage,
    topSpending,
    categories,
    wallets,
    incomeExpenseTransactions,
    status,
    exportReport,
  };
}
