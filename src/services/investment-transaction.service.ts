import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  InvestmentTimelinesResult,
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
  async queryInvestmentTransactions(
    params: InvestmentTransactionListParams,
  ): Promise<InvestmentTransactionListResult> {
    try {
      const { data } = await httpClient.get("/investment-transactions", { params });
      return data.data as InvestmentTransactionListResult;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
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
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
    }
  },

  // Powers InstrumentCard's sparkline, InstrumentDetailView's history chart,
  // and InvestmentAccountCard's sparkline — a lean {date, invested, current}
  // series per account/instrument, computed server-side, instead of fetching
  // every field of every ledger row and replaying it client-side.
  async fetchTimelines(): Promise<InvestmentTimelinesResult> {
    try {
      const { data } = await httpClient.get("/investment-transactions/timelines");
      return data.data as InvestmentTimelinesResult;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
    }
  },

  async createMoneyIn(input: MoneyInInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/in", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
    }
  },

  async createMoneyOut(input: MoneyOutInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/out", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
    }
  },

  async createTransfer(input: TransferInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/transfer", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
    }
  },

  async createProfitLoss(input: ProfitLossInput): Promise<InvestmentTransaction> {
    try {
      const { data } = await httpClient.post("/investment-transactions/pl", input);
      return data.data as InvestmentTransaction;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
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
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
    }
  },

  async deleteInvestmentTransaction(idInvestmentTransaction: string): Promise<void> {
    try {
      await httpClient.delete(`/investment-transactions/${idInvestmentTransaction}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")), {
        cause: error,
      });
    }
  },
};
