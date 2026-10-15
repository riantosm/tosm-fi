import type { Category } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

/** History window analysed, in days back including today. */
export const EXAMPLE_LOOKBACK_DAYS = 30;
/** Occurrences needed before a transaction counts as recurring. */
const MIN_REPEAT = 2;
const MAX_EXAMPLES = 5;

export type ExamplePhrase =
  | {
      kind: "expense" | "income";
      label: string;
      amount: string;
      wallet: string | null;
    }
  | { kind: "transfer"; amount: string; from: string; to: string };

type GroupPhrase =
  { kind: "expense" | "income"; label: string } | { kind: "transfer"; from: string; to: string };

interface Group {
  phrase: GroupPhrase;
  count: number;
  latest: string;
  amounts: Map<number, { count: number; latest: string }>;
  wallets: Map<string, number>;
}

/** Chat-style amount units per UI locale (same as the built-in examples: "25rb", "8m", "2.5万"). */
const CHAT_UNITS: Record<string, [number, string][]> = {
  "id-ID": [
    [1e6, "jt"],
    [1e3, "rb"],
  ],
  "ja-JP": [
    [1e8, "億"],
    [1e4, "万"],
  ],
  default: [
    [1e6, "m"],
    [1e3, "k"],
  ],
};

/**
 * Amount the AI reads back exactly: "18rb", "1,5jt", "18.5k", "1.8万". A unit is used only when
 * the result fits in 2 decimals without rounding; otherwise the plain number without grouping.
 */
export function formatChatAmount(value: number, locale: string): string {
  const format = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    useGrouping: false,
  });
  const units = CHAT_UNITS[locale] ?? CHAT_UNITS.default;
  for (const [threshold, suffix] of units) {
    const hundredths = (Math.abs(value) / threshold) * 100;
    if (hundredths >= 100 && Math.abs(hundredths - Math.round(hundredths)) < 1e-6) {
      return `${format.format(value / threshold)}${suffix}`;
    }
  }
  return format.format(value);
}

function mode<K>(counts: Map<K, { count: number; latest: string } | number>) {
  let best: K | null = null;
  let bestCount = -1;
  let bestLatest = "";
  counts.forEach((entry, key) => {
    const count = typeof entry === "number" ? entry : entry.count;
    const latest = typeof entry === "number" ? "" : entry.latest;
    if (count > bestCount || (count === bestCount && latest > bestLatest)) {
      best = key;
      bestCount = count;
      bestLatest = latest;
    }
  });
  return best;
}

/**
 * Recurring transactions in the history (same title, or transfers between the same wallets) →
 * the "just tap" examples in Catat cepat. Most frequent first, then most recent. Empty = no
 * pattern yet (the panel falls back to the built-in examples).
 */
export function buildHistoryExamples(
  transactions: Transaction[],
  wallets: WalletAccount[],
  categories: Category[],
  locale: string,
): ExamplePhrase[] {
  const walletName = new Map(wallets.map((w) => [w.idWallet, w.nameWallet]));
  const subName = new Map<string, string>();
  const catName = new Map<string, string>();
  categories.forEach((c) => {
    catName.set(c.idCategory, c.nameCategory);
    c.subCategories.forEach((s) => subName.set(s.idSubCategory, s.nameSubCategory));
  });

  const groups = new Map<string, Group>();
  transactions.forEach((tx) => {
    let key: string;
    let phrase: GroupPhrase;
    if (tx.type === "expense" || tx.type === "income") {
      const label =
        tx.title.trim() ||
        (tx.idSubCategory && subName.get(tx.idSubCategory)) ||
        (tx.idCategory && catName.get(tx.idCategory)) ||
        "";
      if (!label) {
        return;
      }
      key = `${tx.type}|${label.toLowerCase().replace(/\s+/g, " ")}`;
      phrase = { kind: tx.type, label };
    } else if (tx.type === "transfer") {
      const from = tx.idWalletFrom && walletName.get(tx.idWalletFrom);
      const to = tx.idWalletTo && walletName.get(tx.idWalletTo);
      if (!from || !to) {
        return;
      }
      key = `transfer|${tx.idWalletFrom}|${tx.idWalletTo}`;
      phrase = { kind: "transfer", from, to };
    } else {
      return;
    }

    const group = groups.get(key) ?? {
      phrase,
      count: 0,
      latest: "",
      amounts: new Map(),
      wallets: new Map(),
    };
    group.count += 1;
    if (tx.date > group.latest) {
      group.latest = tx.date;
      // The label follows the latest spelling ("kopi" → "Kopi").
      group.phrase = phrase;
    }
    const amount = group.amounts.get(tx.amount) ?? { count: 0, latest: "" };
    amount.count += 1;
    amount.latest = tx.date > amount.latest ? tx.date : amount.latest;
    group.amounts.set(tx.amount, amount);
    if (tx.idWallet) {
      group.wallets.set(tx.idWallet, (group.wallets.get(tx.idWallet) ?? 0) + 1);
    }
    groups.set(key, group);
  });

  return [...groups.values()]
    .filter((g) => g.count >= MIN_REPEAT)
    .sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest))
    .slice(0, MAX_EXAMPLES)
    .map((g): ExamplePhrase => {
      const amount = formatChatAmount(mode(g.amounts) ?? 0, locale);
      if (g.phrase.kind === "transfer") {
        return { ...g.phrase, amount };
      }
      const idWallet = mode(g.wallets);
      return {
        ...g.phrase,
        amount,
        wallet: (idWallet && walletName.get(idWallet)) || null,
      };
    });
}
