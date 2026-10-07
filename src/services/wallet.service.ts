import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { WalletAccount, WalletInput } from "@/types/wallet.types";

export const walletService = {
  async fetchWallets(): Promise<WalletAccount[]> {
    try {
      const { data } = await httpClient.get("/wallets");
      return data.data as WalletAccount[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("wallet.genericError")), { cause: error });
    }
  },

  async createWallet(input: WalletInput): Promise<WalletAccount> {
    try {
      const { data } = await httpClient.post("/wallets", input);
      return data.data as WalletAccount;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("wallet.genericError")), { cause: error });
    }
  },

  async updateWallet(id: string, input: WalletInput): Promise<WalletAccount> {
    try {
      const { data } = await httpClient.patch(`/wallets/${id}`, {
        nameWallet: input.nameWallet,
        color: input.color,
      });
      return data.data as WalletAccount;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("wallet.genericError")), { cause: error });
    }
  },

  async deleteWallet(id: string): Promise<void> {
    try {
      await httpClient.delete(`/wallets/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("wallet.genericError")), { cause: error });
    }
  },

  async setPrimaryWallet(id: string): Promise<WalletAccount[]> {
    try {
      const { data } = await httpClient.patch(`/wallets/${id}/primary`);
      return data.data as WalletAccount[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("wallet.genericError")), { cause: error });
    }
  },

  async reorderWallets(orderedIds: string[]): Promise<WalletAccount[]> {
    try {
      const { data } = await httpClient.patch("/wallets/reorder", { orderedIds });
      return data.data as WalletAccount[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("wallet.genericError")), { cause: error });
    }
  },
};
