import { useCallback } from "react";
import { resetCategories, resetTransactions, resetWallets, useAppDispatch } from "@/redux";

export function useResetData() {
  const dispatch = useAppDispatch();

  const resetData = useCallback(() => {
    dispatch(resetWallets());
    dispatch(resetCategories());
    dispatch(resetTransactions());
  }, [dispatch]);

  return { resetData };
}
