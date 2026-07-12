import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WalletAccount } from "@/types/wallet.types";

export type WalletLoadStatus = "idle" | "loading" | "loaded";

export interface IWalletReduxState {
  wallets: WalletAccount[];
  status: WalletLoadStatus;
}

const initialState: IWalletReduxState = {
  wallets: [],
  status: "idle",
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletsLoading: (state) => {
      state.status = "loading";
    },
    setWallets: (state, action: PayloadAction<WalletAccount[]>) => {
      state.wallets = action.payload;
      state.status = "loaded";
    },
    addWallet: (state, action: PayloadAction<WalletAccount>) => {
      state.wallets.push(action.payload);
    },
    updateWallet: (state, action: PayloadAction<WalletAccount>) => {
      const index = state.wallets.findIndex(
        (wallet) => wallet.idWallet === action.payload.idWallet,
      );
      if (index !== -1) state.wallets[index] = action.payload;
    },
    removeWallet: (state, action: PayloadAction<string>) => {
      const wasPrimary = state.wallets.find(
        (wallet) => wallet.idWallet === action.payload,
      )?.isPrimary;
      state.wallets = state.wallets.filter((wallet) => wallet.idWallet !== action.payload);
      if (wasPrimary && state.wallets.length > 0) {
        state.wallets[0].isPrimary = true;
      }
    },
    resetWallets: () => initialState,
  },
});

export const {
  setWalletsLoading,
  setWallets,
  addWallet,
  updateWallet,
  removeWallet,
  resetWallets,
} = walletSlice.actions;

export default walletSlice.reducer;
