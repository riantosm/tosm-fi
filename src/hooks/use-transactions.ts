import { useCallback } from "react";
import { transactionService } from "@/services/transaction.service";
import type { TransactionInput, TransactionListParams } from "@/types/transaction.types";
import {
  addTransaction,
  removeTransaction,
  updateTransaction,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";

export function useTransactions() {
  const dispatch = useAppDispatch();
  // The slice's `transactions` array is only ever fed by the mutation
  // reducers below — nothing loads the full history anymore. Consumers use it
  // purely as an "a mutation happened somewhere" change signal.
  const transactions = useAppSelector((state) => state.transaction.transactions);
  const { loadWallets } = useWallets();
  const { loadCategories } = useCategories();

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
    queryTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
  };
}
