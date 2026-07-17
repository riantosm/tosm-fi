import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { TransactionRow } from "@/components/molecules/TransactionRow";
import { TransferRow } from "@/components/molecules/TransferRow";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import type { Category } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: WalletAccount[];
  onEditTransaction: (transaction: Transaction) => void;
  title?: string;
  headerAction?: ReactNode;
  emptyMessage?: string;
  dateGroupOrder?: "desc" | "asc";
  sortWithinDay?: "chronological" | "amountDesc" | "amountAsc";
  isLoading?: boolean;
}

interface DateGroup {
  dateKey: string;
  date: Date;
  transactions: Transaction[];
  net: number;
}

function toDateKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function netContribution(transaction: Transaction): number {
  switch (transaction.type) {
    case "income":
      return transaction.amount;
    case "expense":
      return -transaction.amount;
    case "correction":
      return transaction.amount;
    case "transfer":
      return 0;
  }
}

function groupByDate(
  transactions: Transaction[],
  dateGroupOrder: "desc" | "asc",
  sortWithinDay: "chronological" | "amountDesc" | "amountAsc",
): DateGroup[] {
  const sorted = [...transactions].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return dateGroupOrder === "desc" ? -diff : diff;
  });
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

  if (sortWithinDay !== "chronological") {
    for (const group of groups.values()) {
      group.transactions.sort((a, b) => {
        const diff = Math.abs(a.amount) - Math.abs(b.amount);
        return sortWithinDay === "amountDesc" ? -diff : diff;
      });
    }
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

export function TransactionList({
  transactions,
  categories,
  wallets,
  onEditTransaction,
  title,
  headerAction,
  emptyMessage,
  dateGroupOrder = "desc",
  sortWithinDay = "chronological",
  isLoading = false,
}: TransactionListProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const resolvedTitle = title === undefined ? t("dashboard.recentTransactions") : title;
  const resolvedEmptyMessage = emptyMessage ?? t("dashboard.noTransactions");

  const groups = useMemo(
    () => groupByDate(transactions, dateGroupOrder, sortWithinDay),
    [transactions, dateGroupOrder, sortWithinDay],
  );

  function resolveCategory(idCategory: string | null) {
    if (!idCategory) return undefined;
    return categories.find((item) => item.idCategory === idCategory);
  }

  function resolveSubCategory(idCategory: string | null, idSubCategory: string | null) {
    if (!idCategory || !idSubCategory) return undefined;
    return resolveCategory(idCategory)?.subCategories.find(
      (sub) => sub.idSubCategory === idSubCategory,
    );
  }

  function resolveWallet(idWallet: string | null) {
    if (!idWallet) return undefined;
    return wallets.find((item) => item.idWallet === idWallet);
  }

  return (
    <div className="flex flex-col gap-3">
      {(resolvedTitle || headerAction) && (
        <div className="flex items-center justify-between gap-3">
          {resolvedTitle && (
            <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-100">
              {resolvedTitle}
            </Words>
          )}
          {headerAction}
        </div>
      )}

      <div className="relative">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-10 dark:border-ink-800">
            <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
              {resolvedEmptyMessage}
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
                  {group.transactions.map((transaction) =>
                    transaction.type === "transfer" ? (
                      <TransferRow
                        key={transaction.idTransaction}
                        transaction={transaction}
                        walletFrom={resolveWallet(transaction.idWalletFrom)}
                        walletTo={resolveWallet(transaction.idWalletTo)}
                        onClick={() => onEditTransaction(transaction)}
                      />
                    ) : (
                      <TransactionRow
                        key={transaction.idTransaction}
                        transaction={transaction}
                        category={resolveCategory(transaction.idCategory)}
                        subCategory={resolveSubCategory(
                          transaction.idCategory,
                          transaction.idSubCategory,
                        )}
                        wallet={resolveWallet(transaction.idWallet)}
                        onClick={() => onEditTransaction(transaction)}
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-start justify-center rounded-2xl bg-white/60 pt-12 backdrop-blur-[2px] dark:bg-ink-950/60">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
}
