import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  Transaction,
  TransactionInput,
  TransactionListParams,
  TransactionListResult,
} from "@/types/transaction.types";

export const transactionService = {
  async fetchTransactions(): Promise<Transaction[]> {
    try {
      const { data } = await httpClient.get("/transactions");
      return data.data.transactions as Transaction[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("transaction.genericError")));
    }
  },

  async queryTransactions(params: TransactionListParams): Promise<TransactionListResult> {
    try {
      const { data } = await httpClient.get("/transactions", { params });
      return data.data as TransactionListResult;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("transaction.genericError")));
    }
  },

  async createTransaction(input: TransactionInput): Promise<Transaction> {
    try {
      const { data } = await httpClient.post("/transactions", input);
      return data.data as Transaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("transaction.genericError")));
    }
  },

  async updateTransaction(idTransaction: string, input: TransactionInput): Promise<Transaction> {
    try {
      const { data } = await httpClient.patch(`/transactions/${idTransaction}`, input);
      return data.data as Transaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("transaction.genericError")));
    }
  },

  async deleteTransaction(idTransaction: string): Promise<void> {
    try {
      await httpClient.delete(`/transactions/${idTransaction}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("transaction.genericError")));
    }
  },
};
