import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  InvestmentTransaction,
  InvestmentTransactionListParams,
  InvestmentTransactionListResult,
  MoneyInInput,
  MoneyOutInput,
  NetWorthTimelineParams,
  NetWorthTimelinePoint,
  ProfitLossInput,
  TransferInput,
  UpdateInvestmentTransactionInput,
} from "@/types/investment-transaction.types";

export const investmentTransactionService = {
  // Unpaginated fetch-all — feeds the redux slice used by InstrumentCard's sparkline
  // and InstrumentDetailPanel's per-account/per-instrument history charts, which
  // still replay the full ledger client-side. Kept separate from
  // queryInvestmentTransactions() (below) so those consumers don't refetch every
  // time the paginated list's filters change.
  async fetchInvestmentTransactions(): Promise<InvestmentTransaction[]> {
    try {
      const { data } = await httpClient.get("/investment-transactions");
      return (data.data as InvestmentTransactionListResult).investmentTransactions;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async queryInvestmentTransactions(
    params: InvestmentTransactionListParams,
  ): Promise<InvestmentTransactionListResult> {
    try {
      const { data } = await httpClient.get("/investment-transactions", { params });
      return data.data as InvestmentTransactionListResult;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async fetchNetWorthTimeline(params: NetWorthTimelineParams): Promise<NetWorthTimelinePoint[]> {
    try {
      const { data } = await httpClient.get("/investment-transactions/net-worth-timeline", {
        params: {
          granularity: params.granularity,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          locale: params.locale,
          idInstrument: params.idInstrument?.length ? params.idInstrument.join(",") : undefined,
        },
      });
      return data.data as NetWorthTimelinePoint[];
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
