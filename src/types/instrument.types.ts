export interface InvestmentAccount {
  idInvestmentAccount: string;
  idInstrument: string;
  nameInvestmentAccount: string;
  investedAmount: number;
  currentValue: number;
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
