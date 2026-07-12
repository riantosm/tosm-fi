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

export interface TransactionListParams {
  /** "YYYY-MM" */
  month: string;
  idWallet?: string;
  idCategory?: string;
  idSubCategory?: string;
  /** "YYYY-MM-DD" */
  dateFrom?: string;
  /** "YYYY-MM-DD" */
  dateTo?: string;
  search?: string;
  sort?: TransactionSortOption;
}
