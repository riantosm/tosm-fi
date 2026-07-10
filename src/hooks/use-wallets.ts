import { useCallback } from "react";
import { walletService } from "@/services/wallet.service";
import type { WalletInput } from "@/types/wallet.types";
import {
  addWallet,
  removeWallet,
  setWallets,
  setWalletsLoading,
  updateWallet,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useWallets() {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector((state) => state.wallet.wallets);
  const status = useAppSelector((state) => state.wallet.status);

  const loadWallets = useCallback(async () => {
    dispatch(setWalletsLoading());
    const data = await walletService.fetchWallets();
    dispatch(setWallets(data));
  }, [dispatch]);

  const createWallet = useCallback(
    async (input: WalletInput) => {
      const created = await walletService.createWallet(input);
      dispatch(addWallet(created));
    },
    [dispatch],
  );

  const editWallet = useCallback(
    async (id: string, input: WalletInput) => {
      const existing = wallets.find((wallet) => wallet.id === id);
      if (!existing) return;
      const updated = await walletService.updateWallet(id, input, existing);
      dispatch(updateWallet(updated));
    },
    [dispatch, wallets],
  );

  const deleteWallet = useCallback(
    async (id: string) => {
      await walletService.deleteWallet(id);
      dispatch(removeWallet(id));
    },
    [dispatch],
  );

  const setPrimaryWallet = useCallback(
    async (id: string) => {
      const updated = await walletService.setPrimaryWallet(id, wallets);
      dispatch(setWallets(updated));
    },
    [dispatch, wallets],
  );

  return { wallets, status, loadWallets, createWallet, editWallet, deleteWallet, setPrimaryWallet };
}
