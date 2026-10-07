import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LuReceiptText } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { InvestmentTransactionRow } from "@/layouts/investment/InvestmentTransactionRow";
import { formatRelativeDay } from "@/layouts/investment/investment-ui";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransaction } from "@/types/investment-transaction.types";

interface InvestmentTransactionListProps {
  transactions: InvestmentTransaction[];
  instruments: Instrument[];
  emptyMessage: string;
  onEditTransaction: (transaction: InvestmentTransaction) => void;
  /** First load — skeleton rows. */
  isLoading?: boolean;
  /** Refetch after a filter change — dims the current rows. */
  isRefreshing?: boolean;
  /** grouped = "Hari ini · 5 Okt" day headers; flat = the day goes into each row's meta. */
  layout?: "grouped" | "flat";
}

interface DateGroup {
  dateKey: string;
  date: Date;
  transactions: InvestmentTransaction[];
}

function groupByDate(transactions: InvestmentTransaction[]): DateGroup[] {
  const groups = new Map<string, DateGroup>();
  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    const key = date.toDateString();
    let group = groups.get(key);
    if (!group) {
      group = { dateKey: key, date, transactions: [] };
      groups.set(key, group);
    }
    group.transactions.push(transaction);
  }
  return Array.from(groups.values());
}

export function InvestmentTransactionList({
  transactions,
  instruments,
  emptyMessage,
  onEditTransaction,
  isLoading = false,
  isRefreshing = false,
  layout = "grouped",
}: InvestmentTransactionListProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const groups = useMemo(() => groupByDate(transactions), [transactions]);
  const dayLabels = { today: t("transaction.today"), yesterday: t("transaction.yesterday") };

  if (isLoading) {
    return (
      <div className="flex flex-col" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3.5 px-2 py-2.5">
            <Skeleton className="size-[42px] shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <EmptyState icon={<LuReceiptText />} title={emptyMessage} className="my-2" />;
  }

  return (
    <div
      className={cn(
        "-mx-2 flex flex-col transition-opacity duration-300",
        isRefreshing && "opacity-60",
      )}
      aria-busy={isRefreshing}
    >
      {layout === "flat"
        ? transactions.map((transaction) => (
            <InvestmentTransactionRow
              key={transaction.idInvestmentTransaction}
              transaction={transaction}
              instruments={instruments}
              showDate
              onClick={() => onEditTransaction(transaction)}
            />
          ))
        : groups.map((group) => (
            <div key={group.dateKey} className="flex animate-fade-in flex-col">
              <span className="px-2 pt-3 pb-1 text-[12.5px] font-semibold text-text-2 lg:text-[13px]">
                {formatRelativeDay(group.date, language, dayLabels, true)}
              </span>
              {group.transactions.map((transaction) => (
                <InvestmentTransactionRow
                  key={transaction.idInvestmentTransaction}
                  transaction={transaction}
                  instruments={instruments}
                  onClick={() => onEditTransaction(transaction)}
                />
              ))}
            </div>
          ))}
    </div>
  );
}
