import { useCallback } from "react";
import { clientErrorService } from "@/services/client-error.service";
import {
  removeClientError,
  setClientErrors,
  setClientErrorsLoading,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import type { ClientErrorListParams } from "@/types/client-error.types";

export function useClientErrors() {
  const dispatch = useAppDispatch();
  const errors = useAppSelector((state) => state.clientError.errors);
  const status = useAppSelector((state) => state.clientError.status);

  const loadClientErrors = useCallback(
    async (params?: ClientErrorListParams) => {
      dispatch(setClientErrorsLoading());
      const data = await clientErrorService.fetchErrors(params);
      dispatch(setClientErrors(data));
    },
    [dispatch],
  );

  const deleteClientError = useCallback(
    async (idClientError: string) => {
      await clientErrorService.deleteError(idClientError);
      dispatch(removeClientError(idClientError));
    },
    [dispatch],
  );

  return { errors, status, loadClientErrors, deleteClientError };
}
