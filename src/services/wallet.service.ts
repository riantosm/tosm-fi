import { MOCK_WALLETS } from "@/constants/mock-wallets";
import type { WalletAccount, WalletInput } from "@/types/wallet.types";

const FAKE_LATENCY_MS = 500;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

export const walletService = {
  async fetchWallets(): Promise<WalletAccount[]> {
    await delay();
    return MOCK_WALLETS;
  },

  async createWallet(input: WalletInput): Promise<WalletAccount> {
    await delay();
    return {
      idWallet: crypto.randomUUID(),
      nameWallet: input.nameWallet,
      color: input.color,
      balance: input.balance ?? 0,
      transactionCount: 0,
      isPrimary: false,
    };
  },

  async updateWallet(
    id: string,
    input: WalletInput,
    current: WalletAccount,
  ): Promise<WalletAccount> {
    await delay();
    return { ...current, idWallet: id, nameWallet: input.nameWallet, color: input.color };
  },

  async deleteWallet(id: string): Promise<void> {
    await delay();
    void id;
  },

  async setPrimaryWallet(id: string, wallets: WalletAccount[]): Promise<WalletAccount[]> {
    await delay();
    return wallets.map((wallet) => ({ ...wallet, isPrimary: wallet.idWallet === id }));
  },

  async reorderWallets(orderedIds: string[], wallets: WalletAccount[]): Promise<WalletAccount[]> {
    await delay();
    const walletsById = new Map(wallets.map((wallet) => [wallet.idWallet, wallet]));
    return orderedIds
      .map((id) => walletsById.get(id))
      .filter((wallet): wallet is WalletAccount => wallet !== undefined);
  },
};
