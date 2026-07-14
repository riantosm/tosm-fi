import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Transaction } from "@/types/transaction.types";

// This slice is never seeded from the server anymore — every page fetches its
// own scoped window via queryTransactions(). The array only accumulates
// mutation results so its reference change can serve as an app-wide "a
// transaction was created/edited/deleted" signal.
export interface ITransactionReduxState {
  transactions: Transaction[];
}

const initialState: ITransactionReduxState = {
  transactions: [],
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(
        (item) => item.idTransaction === action.payload.idTransaction,
      );
      if (index !== -1) state.transactions[index] = action.payload;
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (item) => item.idTransaction !== action.payload,
      );
    },
    resetTransactions: () => initialState,
  },
});

export const {
  addTransaction,
  updateTransaction,
  removeTransaction,
  resetTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
