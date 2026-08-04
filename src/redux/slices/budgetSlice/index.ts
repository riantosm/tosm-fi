import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Budget } from "@/types/budget.types";

export type BudgetLoadStatus = "idle" | "loading" | "loaded";

export interface IBudgetReduxState {
  budgets: Budget[];
  status: BudgetLoadStatus;
}

const initialState: IBudgetReduxState = {
  budgets: [],
  status: "idle",
};

export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setBudgetsLoading: (state) => {
      state.status = "loading";
    },
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
      state.status = "loaded";
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    },
    updateBudgetInState: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex(
        (budget) => budget.idBudget === action.payload.idBudget,
      );
      if (index !== -1) state.budgets[index] = action.payload;
    },
    removeBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter((budget) => budget.idBudget !== action.payload);
    },
    resetBudgets: () => initialState,
  },
});

export const {
  setBudgetsLoading,
  setBudgets,
  addBudget,
  updateBudgetInState,
  removeBudget,
  resetBudgets,
} = budgetSlice.actions;

export default budgetSlice.reducer;
