import { useCallback, useEffect, useMemo, useState } from "react";
import { reportService } from "@/services/report.service";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { useCategories } from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { addMonths, startOfMonth } from "@/utils/month";
import { resolveReportPeriod, toIsoDateString } from "@/utils/report-period";
import type { Transaction } from "@/types/transaction.types";
import type {
  CashFlowPoint,
  CategoryBreakdownItem,
  MonthlyTrendMetric,
  MonthlyTrendPoint,
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
  const [cashFlow, setCashFlow] = useState<CashFlowPoint[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendPoint[]>([]);
  const [walletUsage, setWalletUsage] = useState<WalletUsageItem[]>([]);
  const [topSpending, setTopSpending] = useState<TopSpendingItem[]>([]);
  const [completedKey, setCompletedKey] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadedFetchKey, setLoadedFetchKey] = useState<string | null>(null);

  const resolvedPeriod = useMemo(
    () =>
      resolveReportPeriod(period.preset, new Date(), {
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
      }),
    [period.preset, period.dateFrom, period.dateTo],
  );

  // Reports still compute everything client-side (no report backend yet), but
  // only fetch the date window they actually read: the resolved period, its
  // previous-period comparison span (fetchSummary), and the 12-month trend
  // range (fetchMonthlyTrend) — never the entire unpaginated history.
  const fetchWindow = useMemo(() => {
    const now = new Date();
    const trendFrom = toIsoDateString(addMonths(startOfMonth(now), -(MONTHLY_TREND_MONTHS - 1)));
    const trendTo = toIsoDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return {
      dateFrom:
        resolvedPeriod.previousDateFrom < trendFrom ? resolvedPeriod.previousDateFrom : trendFrom,
      dateTo: resolvedPeriod.dateTo > trendTo ? resolvedPeriod.dateTo : trendTo,
    };
  }, [resolvedPeriod]);
  const fetchKey = JSON.stringify(fetchWindow);

  const areSourcesLoaded =
    loadedFetchKey === fetchKey && walletsStatus === "loaded" && categoriesStatus === "loaded";

  const expenseTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (transaction.type !== "expense") return false;
        const day = transaction.date.slice(0, 10);
        return day >= resolvedPeriod.dateFrom && day <= resolvedPeriod.dateTo;
      }),
    [transactions, resolvedPeriod],
  );

  const incomeExpenseTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (transaction.type !== "expense" && transaction.type !== "income") return false;
        const day = transaction.date.slice(0, 10);
        return day >= resolvedPeriod.dateFrom && day <= resolvedPeriod.dateTo;
      }),
    [transactions, resolvedPeriod],
  );

  useEffect(() => {
    let cancelled = false;

    void queryTransactions(fetchWindow).then((result) => {
      if (cancelled) return;
      setTransactions(result.transactions);
      setLoadedFetchKey(fetchKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey, queryTransactions]);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  const requestKey = JSON.stringify({ resolvedPeriod, monthlyTrendMetric, language });
  const status: ReportStatus = !areSourcesLoaded
    ? "idle"
    : completedKey === requestKey
      ? "loaded"
      : "loading";

  useEffect(() => {
    if (!areSourcesLoaded) return;

    let cancelled = false;

    void Promise.all([
      reportService.fetchSummary(transactions, resolvedPeriod),
      reportService.fetchCashFlow(transactions, resolvedPeriod, language),
      reportService.fetchCategoryBreakdown(transactions, categories, resolvedPeriod),
      reportService.fetchMonthlyTrend(
        transactions,
        monthlyTrendMetric,
        MONTHLY_TREND_MONTHS,
        new Date(),
        language,
      ),
      reportService.fetchWalletUsage(transactions, wallets, resolvedPeriod),
      reportService.fetchTopSpending(transactions, categories, resolvedPeriod, TOP_SPENDING_LIMIT),
    ]).then(
      ([
        summaryResult,
        cashFlowResult,
        expenseBreakdownResult,
        monthlyTrendResult,
        walletUsageResult,
        topSpendingResult,
      ]) => {
        if (cancelled) return;
        setSummary(summaryResult);
        setCashFlow(cashFlowResult);
        setExpenseBreakdown(expenseBreakdownResult);
        setMonthlyTrend(monthlyTrendResult);
        setWalletUsage(walletUsageResult);
        setTopSpending(topSpendingResult);
        setCompletedKey(requestKey);
      },
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areSourcesLoaded, transactions, wallets, categories, resolvedPeriod, monthlyTrendMetric, language]);

  const exportReport = useCallback(
    (format: Exclude<ReportExportFormat, "print">) => reportService.exportReport(format, resolvedPeriod),
    [resolvedPeriod],
  );

  return {
    resolvedPeriod,
    summary,
    cashFlow,
    expenseBreakdown,
    monthlyTrend,
    walletUsage,
    topSpending,
    categories,
    wallets,
    expenseTransactions,
    incomeExpenseTransactions,
    status,
    exportReport,
  };
}
