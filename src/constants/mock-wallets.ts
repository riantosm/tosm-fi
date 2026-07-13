import type { WalletAccount } from "@/types/wallet.types";

export const MOCK_WALLETS: WalletAccount[] = [
  {
    idWallet: "wallet-1",
    nameWallet: "Cash",
    color: "#7CB87C",
    balance: 333_000,
    transactionCount: 12,
    isPrimary: true,
  },
  {
    idWallet: "wallet-2",
    nameWallet: "BCA",
    color: "#4C6FFF",
    balance: 21_623_000,
    transactionCount: 16,
    isPrimary: false,
  },
  {
    idWallet: "wallet-3",
    nameWallet: "Gopay",
    color: "#00BFA6",
    balance: 67_000,
    transactionCount: 10,
    isPrimary: false,
  },
];
