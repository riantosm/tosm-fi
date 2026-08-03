import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";

export type ScheduleOccurrenceLoadStatus = "idle" | "loading" | "loaded";

export interface IScheduleOccurrenceReduxState {
  occurrences: ScheduleOccurrence[];
  status: ScheduleOccurrenceLoadStatus;
}

const initialState: IScheduleOccurrenceReduxState = {
  occurrences: [],
  status: "idle",
};

export const scheduleOccurrenceSlice = createSlice({
  name: "scheduleOccurrence",
  initialState,
  reducers: {
    setOccurrencesLoading: (state) => {
      state.status = "loading";
    },
    setOccurrences: (state, action: PayloadAction<ScheduleOccurrence[]>) => {
      state.occurrences = action.payload;
      state.status = "loaded";
    },
    // Used both after "pay" and after "cancel" — either way the row leaves
    // the pending list.
    removeOccurrence: (state, action: PayloadAction<string>) => {
      state.occurrences = state.occurrences.filter(
        (item) => item.idOccurrence !== action.payload,
      );
    },
    resetScheduleOccurrences: () => initialState,
  },
});

export const {
  setOccurrencesLoading,
  setOccurrences,
  removeOccurrence,
  resetScheduleOccurrences,
} = scheduleOccurrenceSlice.actions;

export default scheduleOccurrenceSlice.reducer;
