import type { WalletAccount } from "@/types/wallet.types";

export const MOCK_WALLETS: WalletAccount[] = [
  {
    idWallet: "wallet-1",
    nameWallet: "Cash",
    color: "#7CB87C",
    balance: 500_000,
    transactionCount: 9,
    isPrimary: true,
  },
  {
    idWallet: "wallet-2",
    nameWallet: "BCA",
    color: "#4C6FFF",
    balance: 30_850_000,
    transactionCount: 7,
    isPrimary: false,
  },
  {
    idWallet: "wallet-3",
    nameWallet: "Gopay",
    color: "#00BFA6",
    balance: 300_000,
    transactionCount: 7,
    isPrimary: false,
  },
];
