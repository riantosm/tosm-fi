import { useCallback } from "react";
import { scheduleOccurrenceService } from "@/services/schedule-occurrence.service";
import type { PayOccurrenceInput } from "@/types/schedule-occurrence.types";
import {
  addTransaction,
  removeOccurrence,
  setOccurrences,
  setOccurrencesLoading,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";

export function useScheduleOccurrences() {
  const dispatch = useAppDispatch();
  const occurrences = useAppSelector((state) => state.scheduleOccurrence.occurrences);
  const status = useAppSelector((state) => state.scheduleOccurrence.status);
  const { loadWallets } = useWallets();
  const { loadCategories } = useCategories();

  const loadPendingOccurrences = useCallback(async () => {
    dispatch(setOccurrencesLoading());
    const data = await scheduleOccurrenceService.fetchPendingOccurrences();
    dispatch(setOccurrences(data));
  }, [dispatch]);

  // Paying creates a real Transaction with wallet-balance/category-count side
  // effects computed backend-side — dispatch straight into transactionSlice
  // (feeding TransactionsPage/DashboardPage's existing mutation-signal
  // pattern) and resync wallets/categories, same convention as
  // use-transactions.ts's createTransaction.
  const payOccurrence = useCallback(
    async (idOccurrence: string, input: PayOccurrenceInput) => {
      const { transaction, occurrence } = await scheduleOccurrenceService.payOccurrence(
        idOccurrence,
        input,
      );
      dispatch(removeOccurrence(occurrence.idOccurrence));
      dispatch(addTransaction(transaction));
      await Promise.all([loadWallets(), loadCategories()]);
      return transaction;
    },
    [dispatch, loadWallets, loadCategories],
  );

  const cancelOccurrence = useCallback(
    async (idOccurrence: string) => {
      const occurrence = await scheduleOccurrenceService.cancelOccurrence(idOccurrence);
      dispatch(removeOccurrence(occurrence.idOccurrence));
    },
    [dispatch],
  );

  return {
    occurrences,
    status,
    loadPendingOccurrences,
    payOccurrence,
    cancelOccurrence,
  };
}
