import { MOCK_TRANSACTIONS } from "@/constants/mock-transactions";
import type { Transaction, TransactionInput } from "@/types/transaction.types";

const FAKE_LATENCY_MS = 500;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

export const transactionService = {
  async fetchTransactions(): Promise<Transaction[]> {
    await delay();
    return MOCK_TRANSACTIONS;
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
