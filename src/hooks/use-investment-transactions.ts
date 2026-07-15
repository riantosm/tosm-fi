import { useCallback } from "react";
import { investmentTransactionService } from "@/services/investment-transaction.service";
import { useInstruments } from "@/hooks/use-instruments";
import type {
  MoneyInInput,
  MoneyOutInput,
  ProfitLossInput,
  TransferInput,
  UpdateInvestmentTransactionInput,
} from "@/types/investment-transaction.types";
import {
  addInvestmentTransaction,
  removeInvestmentTransaction,
  setInvestmentTransactions,
  setInvestmentTransactionsLoading,
  updateInvestmentTransaction,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useInvestmentTransactions() {
  const dispatch = useAppDispatch();
  const { loadInstruments } = useInstruments();
  const investmentTransactions = useAppSelector(
    (state) => state.investmentTransaction.investmentTransactions,
  );
  const status = useAppSelector((state) => state.investmentTransaction.status);

  const loadInvestmentTransactions = useCallback(async () => {
    dispatch(setInvestmentTransactionsLoading());
    const data = await investmentTransactionService.fetchInvestmentTransactions();
    dispatch(setInvestmentTransactions(data));
  }, [dispatch]);

  const createMoneyIn = useCallback(
    async (input: MoneyInInput) => {
      const transaction = await investmentTransactionService.createMoneyIn(input);
      dispatch(addInvestmentTransaction(transaction));
      await loadInstruments();
      return transaction;
    },
    [dispatch, loadInstruments],
  );

  const createMoneyOut = useCallback(
    async (input: MoneyOutInput) => {
      const transaction = await investmentTransactionService.createMoneyOut(input);
      dispatch(addInvestmentTransaction(transaction));
      await loadInstruments();
      return transaction;
    },
    [dispatch, loadInstruments],
  );

  const createTransfer = useCallback(
    async (input: TransferInput) => {
      const transaction = await investmentTransactionService.createTransfer(input);
      dispatch(addInvestmentTransaction(transaction));
      await loadInstruments();
      return transaction;
    },
    [dispatch, loadInstruments],
  );

  const createProfitLoss = useCallback(
    async (input: ProfitLossInput) => {
      const transaction = await investmentTransactionService.createProfitLoss(input);
      dispatch(addInvestmentTransaction(transaction));
      await loadInstruments();
      return transaction;
    },
    [dispatch, loadInstruments],
  );

  const editInvestmentTransaction = useCallback(
    async (id: string, input: UpdateInvestmentTransactionInput) => {
      const transaction = await investmentTransactionService.updateInvestmentTransaction(id, input);
      dispatch(updateInvestmentTransaction(transaction));
      await loadInstruments();
      return transaction;
    },
    [dispatch, loadInstruments],
  );

  const deleteInvestmentTransaction = useCallback(
    async (id: string) => {
      await investmentTransactionService.deleteInvestmentTransaction(id);
      dispatch(removeInvestmentTransaction(id));
      await loadInstruments();
    },
    [dispatch, loadInstruments],
  );

  return {
    investmentTransactions,
    status,
    loadInvestmentTransactions,
    createMoneyIn,
    createMoneyOut,
    createTransfer,
    createProfitLoss,
    editInvestmentTransaction,
    deleteInvestmentTransaction,
  };
}
