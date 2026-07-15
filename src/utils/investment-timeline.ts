import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

export interface TimelinePoint {
  date: string;
  invested: number;
  current: number;
}

// Replays the investment-transaction ledger in date order and, at each event
// that touches the given scope of accounts, emits a point equal to the sum
// of the running invested/current totals across that scope. The ledger is
// only ever used to reconstruct history — "now" always comes from the live
// investedAmount/currentValue fields on InvestmentAccount (see
// src/utils/investment.ts), never from replaying this to the end.
export function buildInvestmentTimeline(
  entries: InvestmentTransaction[],
  scopeAccountIds: ReadonlySet<string>,
): TimelinePoint[] {
  const sorted = [...entries].sort((a, b) => {
    const byDate = new Date(a.date).getTime() - new Date(b.date).getTime();
    return byDate !== 0
      ? byDate
      : a.idInvestmentTransaction.localeCompare(b.idInvestmentTransaction);
  });

  const running = new Map<string, { invested: number; current: number }>();
  function getOrInit(id: string) {
    if (!running.has(id)) running.set(id, { invested: 0, current: 0 });
    return running.get(id)!;
  }
  function sumScope() {
    let invested = 0;
    let current = 0;
    for (const id of scopeAccountIds) {
      const entry = running.get(id);
      if (entry) {
        invested += entry.invested;
        current += entry.current;
      }
    }
    return { invested, current };
  }

  const points: TimelinePoint[] = [];

  for (const entry of sorted) {
    const touchesScope =
      scopeAccountIds.has(entry.idInvestmentAccount) ||
      (entry.idInvestmentAccountTo !== null && scopeAccountIds.has(entry.idInvestmentAccountTo));
    if (!touchesScope) continue;

    // Replay the exact deltas the service applied when this entry was
    // created/edited — no type-specific sign/cap logic needed here, since
    // that was already resolved once at write time (see instrument.service.ts).
    // `?? 0` guards against any legacy/malformed row so a bad value never
    // propagates as NaN through the whole running sum.
    const source = getOrInit(entry.idInvestmentAccount);
    source.invested += entry.investedDelta ?? 0;
    source.current += entry.currentDelta ?? 0;
    if (entry.idInvestmentAccountTo !== null) {
      const destination = getOrInit(entry.idInvestmentAccountTo);
      destination.invested += entry.amount ?? 0;
      destination.current += entry.amount ?? 0;
    }

    points.push({ date: entry.date, ...sumScope() });
  }

  return points;
}

export function buildAccountTimeline(
  entries: InvestmentTransaction[],
  idInvestmentAccount: string,
): TimelinePoint[] {
  return buildInvestmentTimeline(entries, new Set([idInvestmentAccount]));
}

export function buildInstrumentTimeline(
  entries: InvestmentTransaction[],
  instrument: Instrument,
): TimelinePoint[] {
  return buildInvestmentTimeline(
    entries,
    new Set(instrument.investmentAccounts.map((account) => account.idInvestmentAccount)),
  );
}
