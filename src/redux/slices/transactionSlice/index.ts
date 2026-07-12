import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Transaction } from "@/types/transaction.types";

export type TransactionLoadStatus = "idle" | "loading" | "loaded";

export interface ITransactionReduxState {
  transactions: Transaction[];
  status: TransactionLoadStatus;
}

const initialState: ITransactionReduxState = {
  transactions: [],
  status: "idle",
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setTransactionsLoading: (state) => {
      state.status = "loading";
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.status = "loaded";
    },
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
  setTransactionsLoading,
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  resetTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
