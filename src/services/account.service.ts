import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";

export const accountService = {
  async resetData(): Promise<void> {
    try {
      await httpClient.delete("/account/data");
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("settingsDanger.resetError")));
    }
  },
};
