import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { InvestmentTransactionRow } from "@/layouts/investment/InvestmentTransactionRow";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface InvestmentTransactionListProps {
  title?: string;
  transactions: InvestmentTransaction[];
  instruments: Instrument[];
  emptyMessage: string;
  onEditTransaction: (transaction: InvestmentTransaction) => void;
  isLoading?: boolean;
}

interface DateGroup {
  dateKey: string;
  date: Date;
  transactions: InvestmentTransaction[];
  net: number;
}

function toDateKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Transfers move money between two of the user's own accounts — they never
// change the portfolio's overall value, so they don't contribute to the
// day's net total (same reasoning as TransactionList's transfer = 0).
function netContribution(transaction: InvestmentTransaction): number {
  switch (transaction.type) {
    case "in":
      return transaction.amount;
    case "out":
      return -transaction.amount;
    case "pl":
      return transaction.amount;
    case "transfer":
      return 0;
  }
}

function groupByDate(transactions: InvestmentTransaction[]): DateGroup[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const groups = new Map<string, DateGroup>();

  for (const transaction of sorted) {
    const key = toDateKey(transaction.date);
    let group = groups.get(key);
    if (!group) {
      group = { dateKey: key, date: new Date(transaction.date), transactions: [], net: 0 };
      groups.set(key, group);
    }
    group.transactions.push(transaction);
    group.net += netContribution(transaction);
  }

  return Array.from(groups.values());
}

function formatDateHeader(date: Date, locale: string, todayLabel: string): string {
  if (date.toDateString() === new Date().toDateString()) return todayLabel;
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export function InvestmentTransactionList({
  title,
  transactions,
  instruments,
  emptyMessage,
  onEditTransaction,
  isLoading = false,
}: InvestmentTransactionListProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {title}
        </Words>
      )}

      <div className="relative">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-10 dark:border-ink-800">
            <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
              {emptyMessage}
            </Words>
          </div>
        ) : (
          <div className="flex flex-col">
            {groups.map((group) => (
              <div key={group.dateKey} className="flex flex-col">
                <div className="flex items-center justify-between py-2">
                  <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
                    {formatDateHeader(group.date, language, t("transaction.today"))}
                  </Words>
                  <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
                    {group.net === 0 ? "" : group.net < 0 ? "-" : "+"}
                    {format(Math.abs(group.net))}
                  </Words>
                </div>
                <div className="flex flex-col divide-y divide-ink-100 dark:divide-ink-800">
                  {group.transactions.map((transaction) => (
                    <InvestmentTransactionRow
                      key={transaction.idInvestmentTransaction}
                      transaction={transaction}
                      instruments={instruments}
                      onClick={() => onEditTransaction(transaction)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-8 backdrop-blur-[2px] dark:bg-ink-950/60">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
}
