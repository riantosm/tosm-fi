import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  InvestmentTransaction,
  MoneyInInput,
  MoneyOutInput,
  ProfitLossInput,
  TransferInput,
  UpdateInvestmentTransactionInput,
} from "@/types/investment-transaction.types";

export const investmentTransactionService = {
  async fetchInvestmentTransactions(): Promise<InvestmentTransaction[]> {
    try {
      const { data } = await httpClient.get("/investment-transactions");
      return data.data as InvestmentTransaction[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async createMoneyIn(input: MoneyInInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/in", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async createMoneyOut(input: MoneyOutInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/out", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async createTransfer(input: TransferInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/transfer", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async createProfitLoss(input: ProfitLossInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/pl", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async updateInvestmentTransaction(
    idInvestmentTransaction: string,
    input: UpdateInvestmentTransactionInput,
  ): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.patch(
        `/investment-transactions/${idInvestmentTransaction}`,
        input,
      );
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async deleteInvestmentTransaction(idInvestmentTransaction: string): Promise<void> {
    try {
      await httpClient.delete(`/investment-transactions/${idInvestmentTransaction}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },
};
