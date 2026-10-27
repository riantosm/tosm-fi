import type { CategoryType } from "@/types/category.types";

export type TransactionType = CategoryType | "transfer" | "correction";

export interface Transaction {
  idTransaction: string;
  type: TransactionType;
  idWallet: string | null;
  idCategory: string | null;
  idSubCategory: string | null;
  idWalletFrom: string | null;
  idWalletTo: string | null;
  title: string;
  notes: string;
  amount: number;
  date: string;
}

export type TransactionInput = Omit<Transaction, "idTransaction">;

export type TransactionSortOption = "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc";

export type TransactionFilterMode = "include" | "exclude";

export interface TransactionListParams {
  /** "YYYY-MM" */
  month?: string;
  type?: TransactionType;
  /** One id or a comma-separated list. */
  idWallet?: string;
  /** Default "include"; "exclude" hides transactions touching any `idWallet`. */
  walletMode?: TransactionFilterMode;
  /** One id or a comma-separated list. */
  idCategory?: string;
  /** Default "include"; "exclude" hides transactions in any `idCategory`. */
  categoryMode?: TransactionFilterMode;
  /** One id or a comma-separated list. */
  idSubCategory?: string;
  /** Default "include"; "exclude" hides transactions in any `idSubCategory`. */
  subCategoryMode?: TransactionFilterMode;
  /** "YYYY-MM-DD" */
  dateFrom?: string;
  /** "YYYY-MM-DD" */
  dateTo?: string;
  search?: string;
  sort?: TransactionSortOption;
  page?: number;
  limit?: number;
}

export interface TransactionSubCategoryBreakdown {
  idSubCategory: string | null;
  nameSubCategory: string | null;
  icon: string | null;
  amount: number;
  transactionCount: number;
  /** Percentage of the parent category's total. */
  percentage: number;
}

export interface TransactionCategoryBreakdown {
  idCategory: string;
  nameCategory: string;
  color: string;
  icon: string;
  amount: number;
  transactionCount: number;
  /** Percentage of total expense. */
  percentage: number;
  subCategoryBreakdown: TransactionSubCategoryBreakdown[];
}

export interface TransactionSummary {
  income: number;
  expense: number;
  net: number;
  /** Expense-only, sorted descending by amount. */
  categoryBreakdown: TransactionCategoryBreakdown[];
}

export interface TransactionListResult {
  transactions: Transaction[];
  total: number | null;
  page: number | null;
  limit: number | null;
  totalPages: number | null;
  summary: TransactionSummary;
}
