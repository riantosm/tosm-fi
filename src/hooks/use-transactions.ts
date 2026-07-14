import { useCallback } from "react";
import { transactionService } from "@/services/transaction.service";
import type { TransactionInput, TransactionListParams } from "@/types/transaction.types";
import {
  addTransaction,
  removeTransaction,
  setTransactions,
  setTransactionsLoading,
  updateTransaction,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";

export function useTransactions() {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transaction.transactions);
  const status = useAppSelector((state) => state.transaction.status);
  const { loadWallets } = useWallets();
  const { loadCategories } = useCategories();

  const loadTransactions = useCallback(async () => {
    dispatch(setTransactionsLoading());
    const data = await transactionService.fetchTransactions();
    dispatch(setTransactions(data));
  }, [dispatch]);

  const queryTransactions = useCallback(
    (params: TransactionListParams) => transactionService.queryTransactions(params),
    [],
  );

  // Wallet balance / category-subcategory counts are computed and persisted
  // atomically by the backend transaction service — resync both from there
  // instead of guessing the deltas client-side.
  const resyncEffects = useCallback(async () => {
    await Promise.all([loadWallets(), loadCategories()]);
  }, [loadWallets, loadCategories]);

  const createTransaction = useCallback(
    async (input: TransactionInput) => {
      const created = await transactionService.createTransaction(input);
      dispatch(addTransaction(created));
      await resyncEffects();
      return created;
    },
    [dispatch, resyncEffects],
  );

  const editTransaction = useCallback(
    async (idTransaction: string, input: TransactionInput) => {
      const updated = await transactionService.updateTransaction(idTransaction, input);
      dispatch(updateTransaction(updated));
      await resyncEffects();
      return updated;
    },
    [dispatch, resyncEffects],
  );

  const deleteTransaction = useCallback(
    async (idTransaction: string) => {
      await transactionService.deleteTransaction(idTransaction);
      dispatch(removeTransaction(idTransaction));
      await resyncEffects();
    },
    [dispatch, resyncEffects],
  );

  return {
    transactions,
    status,
    loadTransactions,
    queryTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
  };
}
