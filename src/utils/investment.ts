import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

export interface InvestmentTotals {
  investedAmount: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function sumInvestmentAccounts(accounts: InvestmentAccount[]): InvestmentTotals {
  // Soft-deleted accounts are always emptied (currentValue 0) before they can
  // be deleted, but exclude them explicitly anyway so a stray non-zero
  // investedAmount never phantom-counts toward a live total.
  const active = accounts.filter((account) => !account.isDeleted);
  const investedAmount = active.reduce((sum, account) => sum + (account.investedAmount ?? 0), 0);
  const currentValue = active.reduce((sum, account) => sum + (account.currentValue ?? 0), 0);
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

/**
 * `deletedSuffix` (e.g. "(Deleted)", already translated by the caller) is
 * appended when the account was soft-deleted, so a historical
 * investment-transaction can still show which account it was, instead of
 * falling back to "-" once the account no longer appears in the active list.
 */
export function resolveAccountLabel(
  instruments: Instrument[],
  idInstrument: string,
  idInvestmentAccount: string,
  deletedSuffix?: string,
): string {
  const instrument = instruments.find((item) => item.idInstrument === idInstrument);
  const account = instrument?.investmentAccounts.find(
    (item) => item.idInvestmentAccount === idInvestmentAccount,
  );
  if (!instrument || !account) return "-";
  const label = `${instrument.nameInstrument} — ${account.nameInvestmentAccount}`;
  return account.isDeleted && deletedSuffix ? `${label} ${deletedSuffix}` : label;
}
