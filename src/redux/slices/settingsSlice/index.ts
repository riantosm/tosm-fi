import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserSettings } from "@/types/settings.types";

export type SettingsLoadStatus = "idle" | "loading" | "loaded";

export interface ISettingsReduxState extends UserSettings {
  status: SettingsLoadStatus;
}

const initialState: ISettingsReduxState = {
  currency: "IDR",
  decimalPlaces: 0,
  language: "id",
  status: "idle",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettingsLoading: (state) => {
      state.status = "loading";
    },
    setSettings: (state, action: PayloadAction<UserSettings>) => {
      state.currency = action.payload.currency;
      state.decimalPlaces = action.payload.decimalPlaces;
      state.language = action.payload.language;
      state.status = "loaded";
    },
  },
});

export const { setSettingsLoading, setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
