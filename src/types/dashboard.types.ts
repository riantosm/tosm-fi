export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
}

export interface SummaryStat {
  id: string;
  label: string;
  value: number;
  changePercent: number;
  trend: "up" | "down";
}
