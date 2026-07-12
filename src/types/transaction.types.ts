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
