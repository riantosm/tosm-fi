export interface WalletAccount {
  id: string;
  name: string;
  color: string;
  balance: number;
  transactionCount: number;
  isPrimary: boolean;
}

export interface WalletInput {
  name: string;
  color: string;
}
