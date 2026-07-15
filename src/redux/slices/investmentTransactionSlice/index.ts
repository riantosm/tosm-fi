import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

// This slice is never seeded from the server — every consumer fetches its own
// scoped data (queryInvestmentTransactions() or fetchTimelines()). The array
// only accumulates mutation results so its reference change can serve as an
// app-wide "an investment transaction was created/edited/deleted" signal,
// same as transactionSlice.
export interface IInvestmentTransactionReduxState {
  investmentTransactions: InvestmentTransaction[];
}

const initialState: IInvestmentTransactionReduxState = {
  investmentTransactions: [],
};

export const investmentTransactionSlice = createSlice({
  name: "investmentTransaction",
  initialState,
  reducers: {
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
  addInvestmentTransaction,
  updateInvestmentTransaction,
  removeInvestmentTransaction,
  resetInvestmentTransactions,
} = investmentTransactionSlice.actions;

export default investmentTransactionSlice.reducer;
