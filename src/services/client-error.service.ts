import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { ClientError, ClientErrorInput } from "@/types/client-error.types";

export const clientErrorService = {
  // Called from crash-logger.ts, which always wraps this in a .catch() —
  // reporting a crash must never itself throw, so this deliberately doesn't
  // wrap the request in a try/catch + translated error like every other
  // service method here.
  async reportError(input: ClientErrorInput): Promise<void> {
    await httpClient.post("/errors", input);
  },

  async fetchErrors(): Promise<ClientError[]> {
    try {
      const { data } = await httpClient.get("/errors");
      return data.data as ClientError[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("errorLog.genericError")));
    }
  },
};
