import { useCallback } from "react";
import { investmentTransactionService } from "@/services/investment-transaction.service";
import { useInstruments } from "@/hooks/use-instruments";
import type {
  InvestmentTransactionListParams,
  MoneyInInput,
  MoneyOutInput,
  ProfitLossInput,
  TransferInput,
  UpdateInvestmentTransactionInput,
} from "@/types/investment-transaction.types";
import {
  addInvestmentTransaction,
  removeInvestmentTransaction,
  updateInvestmentTransaction,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useInvestmentTransactions() {
  const dispatch = useAppDispatch();
  const { loadInstruments } = useInstruments();
  // Only ever used as an app-wide "something changed" signal (see
  // investmentTransactionSlice) — never rendered directly.
  const investmentTransactions = useAppSelector(
    (state) => state.investmentTransaction.investmentTransactions,
  );

  // Read-only, doesn't touch the redux slice — used by the paginated/filtered
  // transaction list, which manages its own local query state instead of
  // relying on any globally-held array.
  const queryInvestmentTransactions = useCallback(
    (params: InvestmentTransactionListParams) =>
      investmentTransactionService.queryInvestmentTransactions(params),
    [],
  );

  // Read-only, doesn't touch the redux slice — powers InstrumentCard's
  // sparkline, InstrumentDetailPanel's history chart, and
  // InvestmentAccountCard's sparkline.
  const fetchTimelines = useCallback(() => investmentTransactionService.fetchTimelines(), []);

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
    queryInvestmentTransactions,
    fetchTimelines,
    createMoneyIn,
    createMoneyOut,
    createTransfer,
    createProfitLoss,
    editInvestmentTransaction,
    deleteInvestmentTransaction,
  };
}
