import type { WalletAccount } from "@/types/wallet.types";

export const MOCK_WALLETS: WalletAccount[] = [
  {
    id: "wallet-1",
    name: "Cash",
    color: "#7CB87C",
    balance: 0,
    transactionCount: 0,
    isPrimary: true,
  },
];
