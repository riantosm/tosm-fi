import { useCallback } from "react";
import { resetAccountData, useAppDispatch } from "@/redux";
import { accountService } from "@/services/account.service";

export function useResetData() {
  const dispatch = useAppDispatch();

  const resetData = useCallback(async () => {
    await accountService.resetData();
    resetAccountData(dispatch);
  }, [dispatch]);

  return { resetData };
}
