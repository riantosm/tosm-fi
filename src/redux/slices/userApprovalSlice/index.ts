import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/auth.types";

export type UserApprovalLoadStatus = "idle" | "loading" | "loaded";

export interface IUserApprovalReduxState {
  users: AuthUser[];
  status: UserApprovalLoadStatus;
}

const initialState: IUserApprovalReduxState = {
  users: [],
  status: "idle",
};

export const userApprovalSlice = createSlice({
  name: "userApproval",
  initialState,
  reducers: {
    setUserApprovalListLoading: (state) => {
      state.status = "loading";
    },
    setUserApprovalList: (state, action: PayloadAction<AuthUser[]>) => {
      state.users = action.payload;
      state.status = "loaded";
    },
    updateUserApprovalUser: (state, action: PayloadAction<AuthUser>) => {
      const index = state.users.findIndex((user) => user.idUser === action.payload.idUser);
      if (index !== -1) state.users[index] = action.payload;
    },
  },
});

export const { setUserApprovalListLoading, setUserApprovalList, updateUserApprovalUser } =
  userApprovalSlice.actions;

export default userApprovalSlice.reducer;
