import { useCallback } from "react";
import { clientErrorService } from "@/services/client-error.service";
import {
  setClientErrors,
  setClientErrorsLoading,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useClientErrors() {
  const dispatch = useAppDispatch();
  const errors = useAppSelector((state) => state.clientError.errors);
  const status = useAppSelector((state) => state.clientError.status);

  const loadClientErrors = useCallback(async () => {
    dispatch(setClientErrorsLoading());
    const data = await clientErrorService.fetchErrors();
    dispatch(setClientErrors(data));
  }, [dispatch]);

  return { errors, status, loadClientErrors };
}
