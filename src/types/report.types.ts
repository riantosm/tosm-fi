export type ReportPeriodPreset = "today" | "week" | "month" | "year" | "custom" | `month:${string}`;

export interface ReportPeriodFilter {
  preset: ReportPeriodPreset;
  /** "YYYY-MM-DD" inclusive */
  dateFrom: string;
  /** "YYYY-MM-DD" inclusive */
  dateTo: string;
}

export interface ReportMetricDelta {
  value: number;
  /** percentage change vs the immediately preceding period of equal length */
  changePercent: number;
}

export interface ReportSummary {
  totalIncome: ReportMetricDelta;
  totalExpense: ReportMetricDelta;
  netCashFlow: ReportMetricDelta;
  transactionCount: ReportMetricDelta;
}

export interface CashFlowPoint {
  label: string;
  income: number;
  expense: number;
  isToday: boolean;
}

export type CashFlowDisplayMode = "cumulative" | "period";

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

export type MonthlyTrendMetric = "expense" | "income";

export interface MonthlyTrendPoint {
  label: string;
  value: number;
}

export interface WalletUsageItem {
  idWallet: string;
  nameWallet: string;
  color: string;
  transactionCount: number;
  percentage: number;
}

export interface TopSpendingItem {
  idTransaction: string;
  rank: number;
  title: string;
  categoryName: string;
  subCategoryName: string | null;
  amount: number;
  date: string;
}

export type ReportExportFormat = "pdf" | "excel" | "csv" | "print";

export interface ReportData {
  summary: ReportSummary;
  cashFlow: CashFlowPoint[];
  expenseBreakdown: CategoryBreakdownItem[];
  walletUsage: WalletUsageItem[];
  topSpending: TopSpendingItem[];
}
