import { useCallback } from "react";
import { resetAccountData, useAppDispatch } from "@/redux";

export function useResetData() {
  const dispatch = useAppDispatch();

  const resetData = useCallback(() => {
    resetAccountData(dispatch);
  }, [dispatch]);

  return { resetData };
}
