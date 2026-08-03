import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Schedule } from "@/types/schedule.types";

export type ScheduleLoadStatus = "idle" | "loading" | "loaded";

export interface IScheduleReduxState {
  schedules: Schedule[];
  status: ScheduleLoadStatus;
}

const initialState: IScheduleReduxState = {
  schedules: [],
  status: "idle",
};

export const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setSchedulesLoading: (state) => {
      state.status = "loading";
    },
    setSchedules: (state, action: PayloadAction<Schedule[]>) => {
      state.schedules = action.payload;
      state.status = "loaded";
    },
    addSchedule: (state, action: PayloadAction<Schedule>) => {
      state.schedules.push(action.payload);
    },
    updateSchedule: (state, action: PayloadAction<Schedule>) => {
      const index = state.schedules.findIndex(
        (item) => item.idSchedule === action.payload.idSchedule,
      );
      if (index !== -1) state.schedules[index] = action.payload;
    },
    removeSchedule: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter((item) => item.idSchedule !== action.payload);
    },
    resetSchedules: () => initialState,
  },
});

export const {
  setSchedulesLoading,
  setSchedules,
  addSchedule,
  updateSchedule,
  removeSchedule,
  resetSchedules,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
