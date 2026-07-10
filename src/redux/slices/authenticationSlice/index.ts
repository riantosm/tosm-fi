import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, IAuthenticationReduxState } from "@/types/auth.types";

const initialState: IAuthenticationReduxState = {
  isLogin: false,
  userDetail: {},
  token: "",
};

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    onLogin: (state, action: PayloadAction<{ userDetail: AuthUser; token?: string }>) => {
      state.isLogin = true;
      state.userDetail = action.payload.userDetail;
      state.token = action.payload.token ?? "";
    },
    onLogout: (state) => {
      state.isLogin = false;
      state.userDetail = {};
      state.token = "";
    },
    onSetToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    onSetUserDetail: (state, action: PayloadAction<Partial<AuthUser>>) => {
      state.userDetail = action.payload;
    },
  },
});

export const { onLogin, onLogout, onSetToken, onSetUserDetail } = authenticationSlice.actions;

export default authenticationSlice.reducer;
