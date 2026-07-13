import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, IAuthenticationReduxState } from "@/types/auth.types";

const initialState: IAuthenticationReduxState = {
  isLogin: false,
  userDetail: {},
  token: "",
  sessionExpired: false,
};

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    onLogin: (state, action: PayloadAction<{ userDetail: AuthUser; token?: string }>) => {
      state.isLogin = true;
      state.userDetail = action.payload.userDetail;
      state.token = action.payload.token ?? "";
      state.sessionExpired = false;
    },
    onLogout: (state) => {
      state.isLogin = false;
      state.userDetail = {};
      state.token = "";
      state.sessionExpired = false;
    },
    // Fired by the http-client response interceptor when a request comes
    // back 401 for a previously-logged-in session (expired/invalid token).
    // Distinct from onLogout so LoginForm can tell "you were kicked out"
    // apart from a normal, deliberate logout.
    onSessionExpired: (state) => {
      state.isLogin = false;
      state.userDetail = {};
      state.token = "";
      state.sessionExpired = true;
    },
    onDismissSessionExpired: (state) => {
      state.sessionExpired = false;
    },
    onSetToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    onSetUserDetail: (state, action: PayloadAction<Partial<AuthUser>>) => {
      state.userDetail = action.payload;
    },
  },
});

export const {
  onLogin,
  onLogout,
  onSessionExpired,
  onDismissSessionExpired,
  onSetToken,
  onSetUserDetail,
} = authenticationSlice.actions;

export default authenticationSlice.reducer;
