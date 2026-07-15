import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

export interface InvestmentTotals {
  investedAmount: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function sumInvestmentAccounts(accounts: InvestmentAccount[]): InvestmentTotals {
  const investedAmount = accounts.reduce((sum, account) => sum + (account.investedAmount ?? 0), 0);
  const currentValue = accounts.reduce((sum, account) => sum + (account.currentValue ?? 0), 0);
  const profitLoss = currentValue - investedAmount;
  const profitLossPercent = investedAmount === 0 ? 0 : (profitLoss / investedAmount) * 100;
  return { investedAmount, currentValue, profitLoss, profitLossPercent };
}

export function getInstrumentTotals(instrument: Instrument): InvestmentTotals {
  return sumInvestmentAccounts(instrument.investmentAccounts);
}

export function getAccountTotals(account: InvestmentAccount): InvestmentTotals {
  return sumInvestmentAccounts([account]);
}

export function getPortfolioTotals(instruments: Instrument[]): InvestmentTotals {
  return sumInvestmentAccounts(
    instruments.flatMap((instrument) => instrument.investmentAccounts),
  );
}

export function resolveAccountLabel(
  instruments: Instrument[],
  idInstrument: string,
  idInvestmentAccount: string,
): string {
  const instrument = instruments.find((item) => item.idInstrument === idInstrument);
  const account = instrument?.investmentAccounts.find(
    (item) => item.idInvestmentAccount === idInvestmentAccount,
  );
  if (!instrument || !account) return "-";
  return `${instrument.nameInstrument} — ${account.nameInvestmentAccount}`;
}
