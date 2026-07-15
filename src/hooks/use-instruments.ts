import { useCallback } from "react";
import { instrumentService } from "@/services/instrument.service";
import type { InstrumentInput, InvestmentAccountInput } from "@/types/instrument.types";
import {
  addInstrument,
  addInvestmentAccount,
  removeInstrument,
  removeInvestmentAccount,
  setInstruments,
  setInstrumentsLoading,
  updateInstrument,
  updateInvestmentAccount,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useInstruments() {
  const dispatch = useAppDispatch();
  const instruments = useAppSelector((state) => state.instrument.instruments);
  const status = useAppSelector((state) => state.instrument.status);

  const loadInstruments = useCallback(async () => {
    dispatch(setInstrumentsLoading());
    const data = await instrumentService.fetchInstruments();
    dispatch(setInstruments(data));
  }, [dispatch]);

  const createInstrument = useCallback(
    async (input: InstrumentInput) => {
      const created = await instrumentService.createInstrument(input);
      dispatch(addInstrument(created));
      return created;
    },
    [dispatch],
  );

  const editInstrument = useCallback(
    async (id: string, input: InstrumentInput) => {
      const updated = await instrumentService.updateInstrument(id, input);
      dispatch(updateInstrument(updated));
    },
    [dispatch],
  );

  const deleteInstrument = useCallback(
    async (id: string) => {
      await instrumentService.deleteInstrument(id);
      dispatch(removeInstrument(id));
    },
    [dispatch],
  );

  const createInvestmentAccount = useCallback(
    async (idInstrument: string, input: InvestmentAccountInput) => {
      const created = await instrumentService.createInvestmentAccount(idInstrument, input);
      dispatch(addInvestmentAccount({ idInstrument, investmentAccount: created }));
      return created;
    },
    [dispatch],
  );

  const editInvestmentAccount = useCallback(
    async (idInstrument: string, id: string, input: InvestmentAccountInput) => {
      const updated = await instrumentService.updateInvestmentAccount(idInstrument, id, input);
      dispatch(updateInvestmentAccount({ idInstrument, investmentAccount: updated }));
    },
    [dispatch],
  );

  const deleteInvestmentAccount = useCallback(
    async (idInstrument: string, id: string) => {
      await instrumentService.deleteInvestmentAccount(idInstrument, id);
      dispatch(removeInvestmentAccount({ idInstrument, idInvestmentAccount: id }));
    },
    [dispatch],
  );

  return {
    instruments,
    status,
    loadInstruments,
    createInstrument,
    editInstrument,
    deleteInstrument,
    createInvestmentAccount,
    editInvestmentAccount,
    deleteInvestmentAccount,
  };
}
