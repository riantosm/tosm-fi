import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

export type InvestmentTransactionLoadStatus = "idle" | "loading" | "loaded";

export interface IInvestmentTransactionReduxState {
  investmentTransactions: InvestmentTransaction[];
  status: InvestmentTransactionLoadStatus;
}

const initialState: IInvestmentTransactionReduxState = {
  investmentTransactions: [],
  status: "idle",
};

export const investmentTransactionSlice = createSlice({
  name: "investmentTransaction",
  initialState,
  reducers: {
    setInvestmentTransactionsLoading: (state) => {
      state.status = "loading";
    },
    setInvestmentTransactions: (state, action: PayloadAction<InvestmentTransaction[]>) => {
      state.investmentTransactions = action.payload;
      state.status = "loaded";
    },
    addInvestmentTransaction: (state, action: PayloadAction<InvestmentTransaction>) => {
      state.investmentTransactions.push(action.payload);
    },
    updateInvestmentTransaction: (state, action: PayloadAction<InvestmentTransaction>) => {
      const index = state.investmentTransactions.findIndex(
        (item) => item.idInvestmentTransaction === action.payload.idInvestmentTransaction,
      );
      if (index !== -1) state.investmentTransactions[index] = action.payload;
    },
    removeInvestmentTransaction: (state, action: PayloadAction<string>) => {
      state.investmentTransactions = state.investmentTransactions.filter(
        (item) => item.idInvestmentTransaction !== action.payload,
      );
    },
    resetInvestmentTransactions: () => initialState,
  },
});

export const {
  setInvestmentTransactionsLoading,
  setInvestmentTransactions,
  addInvestmentTransaction,
  updateInvestmentTransaction,
  removeInvestmentTransaction,
  resetInvestmentTransactions,
} = investmentTransactionSlice.actions;

export default investmentTransactionSlice.reducer;
