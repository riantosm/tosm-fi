import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { AuthUser } from "@/types/auth.types";

export const userApprovalService = {
  async getList(): Promise<AuthUser[]> {
    try {
      const { data } = await httpClient.get("/user/get-list-user");
      return data.data as AuthUser[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("userApproval.genericError")), {
        cause: error,
      });
    }
  },

  async acceptUser(idUser: string): Promise<AuthUser> {
    try {
      const { data } = await httpClient.post("/user/accept-user", { idUser });
      return data.data as AuthUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("userApproval.genericError")), {
        cause: error,
      });
    }
  },
};
