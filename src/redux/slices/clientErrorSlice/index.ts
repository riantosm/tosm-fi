import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ClientError } from "@/types/client-error.types";

export type ClientErrorLoadStatus = "idle" | "loading" | "loaded";

export interface IClientErrorReduxState {
  errors: ClientError[];
  status: ClientErrorLoadStatus;
}

const initialState: IClientErrorReduxState = {
  errors: [],
  status: "idle",
};

export const clientErrorSlice = createSlice({
  name: "clientError",
  initialState,
  reducers: {
    setClientErrorsLoading: (state) => {
      state.status = "loading";
    },
    setClientErrors: (state, action: PayloadAction<ClientError[]>) => {
      state.errors = action.payload;
      state.status = "loaded";
    },
    removeClientError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter((error) => error.idClientError !== action.payload);
    },
  },
});

export const { setClientErrorsLoading, setClientErrors, removeClientError } =
  clientErrorSlice.actions;
export default clientErrorSlice.reducer;
