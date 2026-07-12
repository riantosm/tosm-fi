import { MOCK_TRANSACTIONS } from "@/constants/mock-transactions";
import type { Transaction, TransactionInput, TransactionListParams } from "@/types/transaction.types";

const FAKE_LATENCY_MS = 500;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

function matchesMonth(dateIso: string, month: string): boolean {
  const date = new Date(dateIso);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return key === month;
}

function matchesWallet(transaction: Transaction, idWallet: string): boolean {
  return (
    transaction.idWallet === idWallet ||
    transaction.idWalletFrom === idWallet ||
    transaction.idWalletTo === idWallet
  );
}

function sortTransactions(
  transactions: Transaction[],
  sort: TransactionListParams["sort"],
): Transaction[] {
  const sorted = [...transactions];
  switch (sort) {
    case "dateAsc":
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case "amountDesc":
      return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    case "amountAsc":
      return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    case "dateDesc":
    default:
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const transactionService = {
  async fetchTransactions(): Promise<Transaction[]> {
    await delay();
    return MOCK_TRANSACTIONS;
  },

  /**
   * Simulates a server-side filtered/sorted list query (`GET /transactions?...`).
   * `source` is the caller's current transaction set — once a real backend exists
   * this becomes a plain params-only call and `source` goes away.
   */
  async queryTransactions(
    source: Transaction[],
    params: TransactionListParams,
  ): Promise<Transaction[]> {
    await delay();

    const search = params.search?.trim().toLowerCase();

    const filtered = source.filter((transaction) => {
      if (!matchesMonth(transaction.date, params.month)) return false;
      if (params.idWallet && !matchesWallet(transaction, params.idWallet)) return false;
      if (params.idCategory && transaction.idCategory !== params.idCategory) return false;
      if (params.idSubCategory && transaction.idSubCategory !== params.idSubCategory) {
        return false;
      }
      if (params.dateFrom && transaction.date.slice(0, 10) < params.dateFrom) return false;
      if (params.dateTo && transaction.date.slice(0, 10) > params.dateTo) return false;
      if (search) {
        const haystack = `${transaction.title} ${transaction.notes}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    return sortTransactions(filtered, params.sort);
  },

  async createTransaction(input: TransactionInput): Promise<Transaction> {
    await delay();
    return {
      idTransaction: crypto.randomUUID(),
      ...input,
    };
  },

  async updateTransaction(
    idTransaction: string,
    input: TransactionInput,
    current: Transaction,
  ): Promise<Transaction> {
    await delay();
    return {
      ...current,
      ...input,
      idTransaction,
    };
  },

  async deleteTransaction(idTransaction: string): Promise<void> {
    await delay();
    void idTransaction;
  },
};
