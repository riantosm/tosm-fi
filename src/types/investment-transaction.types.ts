export type InvestmentTransactionType = "in" | "out" | "transfer" | "pl";

export interface InvestmentTransaction {
  idInvestmentTransaction: string;
  type: InvestmentTransactionType;
  date: string;
  idInstrument: string;
  idInvestmentAccount: string;
  idInstrumentTo: string | null;
  idInvestmentAccountTo: string | null;
  // Display magnitude: in/out/transfer = positive amount moved; pl = signed delta (new - old current value).
  amount: number;
  // The ACTUAL signed delta applied to idInvestmentAccount's investedAmount/currentValue
  // at the moment this entry was created (out/transfer's invested delta can be less than
  // -amount, since invested is never allowed to go below 0 — see computeOutgoingDelta).
  // Stored explicitly so edits/deletes can reverse this entry exactly, and so chart replay
  // never needs to re-derive type-specific sign/cap logic. For transfer, the destination
  // account always receives the untouched (+amount, +amount) pair (never capped).
  investedDelta: number;
  currentDelta: number;
  // in: linked wallet expense transaction id. out: linked wallet income transaction id
  // iff deposited to wallet, else null. transfer/pl: always null.
  idTransaction: string | null;
  note?: string;
}

export interface UpdateInvestmentTransactionInput {
  amount: number;
  date: string;
  note?: string;
}

export interface MoneyInInput {
  idInstrument: string;
  idInvestmentAccount: string;
  amount: number;
  date: string;
  idTransaction: string;
}

export interface MoneyOutInput {
  idInstrument: string;
  idInvestmentAccount: string;
  amount: number;
  date: string;
  idTransaction: string | null;
  note?: string;
}

export interface TransferInput {
  idInstrument: string;
  idInvestmentAccount: string;
  idInstrumentTo: string;
  idInvestmentAccountTo: string;
  amount: number;
  date: string;
}

export interface ProfitLossInput {
  idInstrument: string;
  idInvestmentAccount: string;
  newCurrentValue: number;
  date: string;
}

export type InvestmentTransactionSortOption = "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc";

export interface InvestmentTransactionListParams {
  /** Matches idInstrument OR idInstrumentTo (source or transfer destination). */
  idInstrument?: string;
  type?: InvestmentTransactionType;
  /** "YYYY-MM-DD" */
  dateFrom?: string;
  /** "YYYY-MM-DD" */
  dateTo?: string;
  /** Matches note, or the resolved instrument/account name. */
  search?: string;
  sort?: InvestmentTransactionSortOption;
  page?: number;
  limit?: number;
}

export interface InvestmentTransactionListResult {
  investmentTransactions: InvestmentTransaction[];
  total: number | null;
  page: number | null;
  limit: number | null;
  totalPages: number | null;
}

export type NetWorthTimelineGranularity = "day" | "month" | "year";

export interface NetWorthTimelineParams {
  granularity: NetWorthTimelineGranularity;
  /** "YYYY-MM-DD" */
  dateFrom: string;
  /** "YYYY-MM-DD" */
  dateTo: string;
  locale: string;
  /** Subset of instrument ids to scope the timeline to; omit for the whole portfolio. */
  idInstrument?: string[];
}

export interface NetWorthTimelinePoint {
  label: string;
  date: string;
  invested: number;
  current: number;
}
