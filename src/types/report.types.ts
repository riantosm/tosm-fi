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

export type MonthlyTrendMetric = "expense" | "income";

export interface MonthlyTrendPoint {
  label: string;
  value: number;
}

/** Raw shape from `GET /reports/monthly-trend` — both metrics per month so the FE can
 * toggle Pengeluaran/Pemasukan without refetching. */
export interface MonthlyTrendRawPoint {
  label: string;
  income: number;
  expense: number;
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

export type FinancialHealthStatus = "excellent" | "good" | "fair" | "needsAttention";

export interface FinancialHealth {
  score: number;
  status: FinancialHealthStatus;
  savingRate: number;
  isCashFlowPositive: boolean;
  isExpenseStable: boolean;
}

export interface DashboardSummary {
  wallet: { totalBalance: number; walletCount: number };
  investment: { totalCurrentValue: number; instrumentCount: number };
  monthly: { income: number; expense: number; savings: number };
  financialHealth: FinancialHealth;
}
