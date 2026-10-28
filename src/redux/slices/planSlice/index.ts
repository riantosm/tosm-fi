import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PlanInfo } from "@/types/plan.types";

export type PlanLoadStatus = "idle" | "loading" | "loaded";

export interface IPlanReduxState {
  info: PlanInfo | null;
  status: PlanLoadStatus;
}

const initialState: IPlanReduxState = {
  info: null,
  status: "idle",
};

export const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlanLoading: (state) => {
      state.status = "loading";
    },
    setPlanInfo: (state, action: PayloadAction<PlanInfo>) => {
      state.info = action.payload;
      state.status = "loaded";
    },
    resetPlan: () => initialState,
  },
});

export const { setPlanLoading, setPlanInfo, resetPlan } = planSlice.actions;

export default planSlice.reducer;
