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

export function useReports(period: ReportPeriodFilter, monthlyTrendMetric: MonthlyTrendMetric) {
  const { queryTransactions } = useTransactions();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { language } = useLanguage();

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<TransactionCategoryBreakdown[]>([]);
  const [summaryCompletedKey, setSummaryCompletedKey] = useState<string | null>(null);

  const [cashFlow, setCashFlow] = useState<CashFlowPoint[]>([]);
  const [cashFlowCompletedKey, setCashFlowCompletedKey] = useState<string | null>(null);

  const [monthlyTrendRaw, setMonthlyTrendRaw] = useState<MonthlyTrendRawPoint[]>([]);
  const [monthlyTrendCompletedKey, setMonthlyTrendCompletedKey] = useState<string | null>(null);

  const [walletUsage, setWalletUsage] = useState<WalletUsageItem[]>([]);
  const [walletUsageCompletedKey, setWalletUsageCompletedKey] = useState<string | null>(null);

  const [topSpending, setTopSpending] = useState<TopSpendingItem[]>([]);
  const [topSpendingCompletedKey, setTopSpendingCompletedKey] = useState<string | null>(null);

  const [periodTransactions, setPeriodTransactions] = useState<Transaction[]>([]);

  const resolvedPeriod = useMemo(
    () =>
      resolveReportPeriod(period.preset, new Date(), {
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
      }),
    [period.preset, period.dateFrom, period.dateTo],
  );

  // Only raw transaction fetch left on this page — scoped tightly to the resolved period.
  // Feeds only the export's transaction-list section (not rendered directly, no loading UI).
  useEffect(() => {
    let cancelled = false;

    void queryTransactions({ dateFrom: resolvedPeriod.dateFrom, dateTo: resolvedPeriod.dateTo })
      .then((result) => {
        if (cancelled) return;
        setPeriodTransactions(result.transactions);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load period transactions", error);
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

  // Every widget below fetches from its own dedicated endpoint independently. Each "is loading"
  // flag is derived by comparing a request key (the args this render wants) against a completed
  // key (the args last successfully fetched) instead of a separate boolean toggled inside the
  // effect — so a fast card can render before a slower one finishes, without setState firing
  // synchronously in the effect body.

  const summaryRequestKey = JSON.stringify(resolvedPeriod);
  const isSummaryLoading = summaryCompletedKey !== summaryRequestKey;

  useEffect(() => {
    let cancelled = false;

    void reportService
      .fetchSummary(
        resolvedPeriod.dateFrom,
        resolvedPeriod.dateTo,
        resolvedPeriod.previousDateFrom,
        resolvedPeriod.previousDateTo,
      )
      .then((result) => {
        if (cancelled) return;
        setSummary(result.summary);
        setCategoryBreakdown(result.categoryBreakdown);
        setSummaryCompletedKey(summaryRequestKey);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load report summary", error);
        setSummaryCompletedKey(summaryRequestKey);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPeriod]);

  const cashFlowRequestKey = JSON.stringify({ resolvedPeriod, language });
  const isCashFlowLoading = cashFlowCompletedKey !== cashFlowRequestKey;

  useEffect(() => {
    let cancelled = false;

    void reportService
      .fetchCashFlow(resolvedPeriod.dateFrom, resolvedPeriod.dateTo, language)
      .then((result) => {
        if (cancelled) return;
        setCashFlow(result);
        setCashFlowCompletedKey(cashFlowRequestKey);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load cash flow", error);
        setCashFlowCompletedKey(cashFlowRequestKey);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPeriod, language]);

  // Doesn't depend on resolvedPeriod — it's always the trailing MONTHLY_TREND_MONTHS from now,
  // independent of the selected report period, so switching periods never refetches this.
  const monthlyTrendRequestKey = language;
  const isMonthlyTrendLoading = monthlyTrendCompletedKey !== monthlyTrendRequestKey;

  useEffect(() => {
    let cancelled = false;

    void reportService
      .fetchMonthlyTrend(MONTHLY_TREND_MONTHS, language)
      .then((result) => {
        if (cancelled) return;
        setMonthlyTrendRaw(result);
        setMonthlyTrendCompletedKey(monthlyTrendRequestKey);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load monthly trend", error);
        setMonthlyTrendCompletedKey(monthlyTrendRequestKey);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const walletUsageRequestKey = JSON.stringify(resolvedPeriod);
  const isWalletUsageLoading = walletUsageCompletedKey !== walletUsageRequestKey;

  useEffect(() => {
    let cancelled = false;

    void reportService
      .fetchWalletUsage(resolvedPeriod.dateFrom, resolvedPeriod.dateTo)
      .then((result) => {
        if (cancelled) return;
        setWalletUsage(result);
        setWalletUsageCompletedKey(walletUsageRequestKey);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load wallet usage", error);
        setWalletUsageCompletedKey(walletUsageRequestKey);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPeriod]);

  const topSpendingRequestKey = JSON.stringify(resolvedPeriod);
  const isTopSpendingLoading = topSpendingCompletedKey !== topSpendingRequestKey;

  useEffect(() => {
    let cancelled = false;

    void reportService
      .fetchTopSpending(resolvedPeriod.dateFrom, resolvedPeriod.dateTo, TOP_SPENDING_LIMIT)
      .then((result) => {
        if (cancelled) return;
        setTopSpending(result);
        setTopSpendingCompletedKey(topSpendingRequestKey);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load top spending", error);
        setTopSpendingCompletedKey(topSpendingRequestKey);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPeriod]);

  const exportReport = useCallback(
    (format: Exclude<ReportExportFormat, "print">) => reportService.exportReport(format, resolvedPeriod),
    [resolvedPeriod],
  );

  return {
    resolvedPeriod,
    summary,
    isSummaryLoading,
    cashFlow,
    isCashFlowLoading,
    categoryBreakdown,
    monthlyTrend,
    isMonthlyTrendLoading,
    walletUsage,
    isWalletUsageLoading,
    topSpending,
    isTopSpendingLoading,
    categories,
    wallets,
    incomeExpenseTransactions,
    exportReport,
  };
}
