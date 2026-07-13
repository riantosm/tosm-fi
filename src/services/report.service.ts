import { generateMonthRange, isSameMonthAs } from "@/utils/month";
import { buildReportBuckets, type ResolvedReportPeriod } from "@/utils/report-period";
import type { Category } from "@/types/category.types";
import type {
  CashFlowPoint,
  CategoryBreakdownItem,
  MonthlyTrendMetric,
  MonthlyTrendPoint,
  ReportExportFormat,
  ReportSummary,
  TopSpendingItem,
  WalletUsageItem,
} from "@/types/report.types";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

const FAKE_LATENCY_MS = 400;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

function filterByRange(transactions: Transaction[], dateFrom: string, dateTo: string): Transaction[] {
  return transactions.filter((transaction) => {
    const day = transaction.date.slice(0, 10);
    return day >= dateFrom && day <= dateTo;
  });
}

function sumByType(transactions: Transaction[], type: Transaction["type"]): number {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
}

function computeChangePercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function walletIdsInvolved(transaction: Transaction): string[] {
  if (transaction.type === "transfer") {
    return [transaction.idWalletFrom, transaction.idWalletTo].filter(
      (id): id is string => Boolean(id),
    );
  }
  return transaction.idWallet ? [transaction.idWallet] : [];
}

function formatMonthShortLabel(date: Date, locale: string): string {
  const label = new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
  const currentYear = new Date().getFullYear();
  return date.getFullYear() === currentYear ? label : `${label} '${String(date.getFullYear()).slice(-2)}`;
}

export const reportService = {
  async fetchSummary(transactions: Transaction[], period: ResolvedReportPeriod): Promise<ReportSummary> {
    await delay();

    const current = filterByRange(transactions, period.dateFrom, period.dateTo);
    const previous = filterByRange(transactions, period.previousDateFrom, period.previousDateTo);

    const currentIncome = sumByType(current, "income");
    const currentExpense = sumByType(current, "expense");
    const previousIncome = sumByType(previous, "income");
    const previousExpense = sumByType(previous, "expense");

    const currentNet = currentIncome - currentExpense;
    const previousNet = previousIncome - previousExpense;

    return {
      totalIncome: {
        value: currentIncome,
        changePercent: computeChangePercent(currentIncome, previousIncome),
      },
      totalExpense: {
        value: currentExpense,
        changePercent: computeChangePercent(currentExpense, previousExpense),
      },
      netCashFlow: {
        value: currentNet,
        changePercent: computeChangePercent(currentNet, previousNet),
      },
      transactionCount: {
        value: current.length,
        changePercent: computeChangePercent(current.length, previous.length),
      },
    };
  },

  async fetchCashFlow(
    transactions: Transaction[],
    period: ResolvedReportPeriod,
    locale: string,
  ): Promise<CashFlowPoint[]> {
    await delay();

    const buckets = buildReportBuckets(period.dateFrom, period.dateTo, locale);

    return buckets.map((bucket) => {
      let income = 0;
      let expense = 0;
      for (const transaction of transactions) {
        const time = new Date(transaction.date).getTime();
        if (time < bucket.start.getTime() || time > bucket.end.getTime()) continue;
        if (transaction.type === "income") income += transaction.amount;
        if (transaction.type === "expense") expense += Math.abs(transaction.amount);
      }
      return { label: bucket.label, income, expense };
    });
  },

  async fetchMonthlyTrend(
    transactions: Transaction[],
    metric: MonthlyTrendMetric,
    monthsCount: number,
    referenceDate: Date,
    locale: string,
  ): Promise<MonthlyTrendPoint[]> {
    await delay();

    const months = generateMonthRange(referenceDate, monthsCount - 1, 0);

    return months.map((month) => {
      const monthTransactions = transactions.filter((transaction) =>
        isSameMonthAs(new Date(transaction.date), month),
      );
      const value = sumByType(monthTransactions, metric);
      return { label: formatMonthShortLabel(month, locale), value };
    });
  },

  async fetchWalletUsage(
    transactions: Transaction[],
    wallets: WalletAccount[],
    period: ResolvedReportPeriod,
  ): Promise<WalletUsageItem[]> {
    await delay();

    const periodTransactions = filterByRange(transactions, period.dateFrom, period.dateTo);
    const counts = new Map<string, number>();
    for (const transaction of periodTransactions) {
      for (const idWallet of walletIdsInvolved(transaction)) {
        counts.set(idWallet, (counts.get(idWallet) ?? 0) + 1);
      }
    }

    const totalCount = [...counts.values()].reduce((sum, count) => sum + count, 0);

    return wallets
      .map((wallet) => {
        const transactionCount = counts.get(wallet.idWallet) ?? 0;
        return {
          idWallet: wallet.idWallet,
          nameWallet: wallet.nameWallet,
          color: wallet.color,
          transactionCount,
          percentage: totalCount > 0 ? (transactionCount / totalCount) * 100 : 0,
        };
      })
      .filter((item) => item.transactionCount > 0)
      .sort((a, b) => b.transactionCount - a.transactionCount);
  },

  async fetchCategoryBreakdown(
    transactions: Transaction[],
    categories: Category[],
    period: ResolvedReportPeriod,
  ): Promise<CategoryBreakdownItem[]> {
    await delay();

    const periodExpenses = filterByRange(transactions, period.dateFrom, period.dateTo).filter(
      (transaction) => transaction.type === "expense",
    );

    const totals = new Map<string, { total: number; count: number }>();
    for (const transaction of periodExpenses) {
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
        };
      })
      .sort((a, b) => b.total - a.total);
  },

  async fetchTopSpending(
    transactions: Transaction[],
    categories: Category[],
    period: ResolvedReportPeriod,
    limit: number,
  ): Promise<TopSpendingItem[]> {
    await delay();

    const periodExpenses = filterByRange(transactions, period.dateFrom, period.dateTo).filter(
      (transaction) => transaction.type === "expense",
    );
    const sorted = [...periodExpenses]
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, limit);

    return sorted.map((transaction, index) => {
      const category = categories.find((item) => item.idCategory === transaction.idCategory);
      const subCategory = category?.subCategories.find(
        (item) => item.idSubCategory === transaction.idSubCategory,
      );
      return {
        idTransaction: transaction.idTransaction,
        rank: index + 1,
        title: transaction.title || category?.nameCategory || "-",
        categoryName: category?.nameCategory ?? "-",
        subCategoryName: subCategory?.nameSubCategory ?? null,
        amount: Math.abs(transaction.amount),
        date: transaction.date,
      };
    });
  },

  async exportReport(
    format: Exclude<ReportExportFormat, "print">,
    period: ResolvedReportPeriod,
  ): Promise<{ fileName: string }> {
    await delay();
    const extension = format === "excel" ? "xlsx" : format === "csv" ? "csv" : "pdf";
    return { fileName: `laporan_${period.dateFrom}_${period.dateTo}.${extension}` };
  },
};
