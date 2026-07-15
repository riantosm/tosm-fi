export interface InvestmentAccount {
  idInvestmentAccount: string;
  idInstrument: string;
  nameInvestmentAccount: string;
  investedAmount: number;
  currentValue: number;
  // Soft-deleted (kept for historical investment-transaction labels) rather
  // than actually removed — hidden from the active account grid/picker.
  isDeleted: boolean;
}

export interface Instrument {
  idInstrument: string;
  nameInstrument: string;
  color: string;
  investmentAccounts: InvestmentAccount[];
}

export interface InstrumentInput {
  nameInstrument: string;
  color: string;
}

export interface InvestmentAccountInput {
  nameInvestmentAccount: string;
}
