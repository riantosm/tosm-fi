import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  Instrument,
  InstrumentInput,
  InvestmentAccount,
  InvestmentAccountInput,
} from "@/types/instrument.types";

export const instrumentService = {
  async fetchInstruments(): Promise<Instrument[]> {
    try {
      const { data } = await httpClient.get("/instruments");
      return data.data as Instrument[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async createInstrument(input: InstrumentInput): Promise<Instrument> {
    try {
      const { data } = await httpClient.post("/instruments", input);
      return data.data as Instrument;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async updateInstrument(idInstrument: string, input: InstrumentInput): Promise<Instrument> {
    try {
      const { data } = await httpClient.patch(`/instruments/${idInstrument}`, input);
      return data.data as Instrument;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async deleteInstrument(idInstrument: string): Promise<void> {
    try {
      await httpClient.delete(`/instruments/${idInstrument}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async createInvestmentAccount(
    idInstrument: string,
    input: InvestmentAccountInput,
  ): Promise<InvestmentAccount> {
    try {
      const { data } = await httpClient.post(`/instruments/${idInstrument}/accounts`, input);
      return data.data as InvestmentAccount;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async updateInvestmentAccount(
    idInstrument: string,
    idInvestmentAccount: string,
    input: InvestmentAccountInput,
  ): Promise<InvestmentAccount> {
    try {
      const { data } = await httpClient.patch(
        `/instruments/${idInstrument}/accounts/${idInvestmentAccount}`,
        input,
      );
      return data.data as InvestmentAccount;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },

  async deleteInvestmentAccount(idInstrument: string, idInvestmentAccount: string): Promise<void> {
    try {
      await httpClient.delete(`/instruments/${idInstrument}/accounts/${idInvestmentAccount}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("investment.genericError")));
    }
  },
};
