import type { WalletAccount } from "@/types/wallet.types";

export const MOCK_WALLETS: WalletAccount[] = [
  {
    idWallet: "wallet-1",
    nameWallet: "Cash",
    color: "#7CB87C",
    balance: 0,
    transactionCount: 0,
    isPrimary: true,
  },
];
