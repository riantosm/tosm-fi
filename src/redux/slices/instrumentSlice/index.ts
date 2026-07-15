import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

export type InstrumentLoadStatus = "idle" | "loading" | "loaded";

export interface IInstrumentReduxState {
  instruments: Instrument[];
  status: InstrumentLoadStatus;
}

const initialState: IInstrumentReduxState = {
  instruments: [],
  status: "idle",
};

export const instrumentSlice = createSlice({
  name: "instrument",
  initialState,
  reducers: {
    setInstrumentsLoading: (state) => {
      state.status = "loading";
    },
    setInstruments: (state, action: PayloadAction<Instrument[]>) => {
      state.instruments = action.payload;
      state.status = "loaded";
    },
    addInstrument: (state, action: PayloadAction<Instrument>) => {
      state.instruments.push(action.payload);
    },
    updateInstrument: (state, action: PayloadAction<Instrument>) => {
      const index = state.instruments.findIndex(
        (instrument) => instrument.idInstrument === action.payload.idInstrument,
      );
      if (index !== -1) state.instruments[index] = action.payload;
    },
    removeInstrument: (state, action: PayloadAction<string>) => {
      state.instruments = state.instruments.filter(
        (instrument) => instrument.idInstrument !== action.payload,
      );
    },
    addInvestmentAccount: (
      state,
      action: PayloadAction<{ idInstrument: string; investmentAccount: InvestmentAccount }>,
    ) => {
      const instrument = state.instruments.find(
        (item) => item.idInstrument === action.payload.idInstrument,
      );
      if (instrument) instrument.investmentAccounts.push(action.payload.investmentAccount);
    },
    updateInvestmentAccount: (
      state,
      action: PayloadAction<{ idInstrument: string; investmentAccount: InvestmentAccount }>,
    ) => {
      const instrument = state.instruments.find(
        (item) => item.idInstrument === action.payload.idInstrument,
      );
      if (!instrument) return;
      const index = instrument.investmentAccounts.findIndex(
        (account) =>
          account.idInvestmentAccount === action.payload.investmentAccount.idInvestmentAccount,
      );
      if (index !== -1) instrument.investmentAccounts[index] = action.payload.investmentAccount;
    },
    removeInvestmentAccount: (
      state,
      action: PayloadAction<{ idInstrument: string; idInvestmentAccount: string }>,
    ) => {
      const instrument = state.instruments.find(
        (item) => item.idInstrument === action.payload.idInstrument,
      );
      if (!instrument) return;
      instrument.investmentAccounts = instrument.investmentAccounts.filter(
        (account) => account.idInvestmentAccount !== action.payload.idInvestmentAccount,
      );
    },
    resetInstruments: () => initialState,
  },
});

export const {
  setInstrumentsLoading,
  setInstruments,
  addInstrument,
  updateInstrument,
  removeInstrument,
  addInvestmentAccount,
  updateInvestmentAccount,
  removeInvestmentAccount,
  resetInstruments,
} = instrumentSlice.actions;

export default instrumentSlice.reducer;
