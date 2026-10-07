import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LuReceiptText } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SectionHead } from "@/components/molecules/SectionHead";
import { TransactionRow } from "@/components/molecules/TransactionRow";
import { TransferRow } from "@/components/molecules/TransferRow";
import { ScheduledTransactionRow } from "@/components/molecules/ScheduledTransactionRow";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import type { Category } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";

interface TransactionListProps {
  transactions: Transaction[];
  // Pending schedule occurrences to render inline, styled as not-yet-real —
  // their amount never contributes to a day group's net total (see
  // netContribution below), only actual transactions do.
  occurrences?: ScheduleOccurrence[];
  categories: Category[];
  wallets: WalletAccount[];
  onEditTransaction: (transaction: Transaction) => void;
  onPayOccurrence?: (occurrence: ScheduleOccurrence) => void;
  onCancelOccurrence?: (occurrence: ScheduleOccurrence) => void;
  title?: string;
  /** Small uppercase label above the title (e.g. "AKTIVITAS"). */
  eyebrow?: string;
  headerAction?: ReactNode;
  emptyMessage?: string;
  dateGroupOrder?: "desc" | "asc";
  /** short = "HARI INI" / "KEMARIN" / "Sabtu, 3 Oktober"; full = "HARI INI · SENIN 5 OKT" / "SABTU 3 OKT". */
  dayHeaderStyle?: "short" | "full";
  sortWithinDay?: "chronological" | "amountDesc" | "amountAsc";
  isLoading?: boolean;
}

type ListEntry =
  | { kind: "transaction"; date: string; amount: number; transaction: Transaction }
  | { kind: "occurrence"; date: string; amount: number; occurrence: ScheduleOccurrence };

interface DateGroup {
  dateKey: string;
  date: Date;
  entries: ListEntry[];
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
  entries: ListEntry[],
  dateGroupOrder: "desc" | "asc",
  sortWithinDay: "chronological" | "amountDesc" | "amountAsc",
): DateGroup[] {
  const sorted = [...entries].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return dateGroupOrder === "desc" ? -diff : diff;
  });
  const groups = new Map<string, DateGroup>();

  for (const entry of sorted) {
    const key = toDateKey(entry.date);
    let group = groups.get(key);
    if (!group) {
      group = { dateKey: key, date: new Date(entry.date), entries: [], net: 0 };
      groups.set(key, group);
    }
    group.entries.push(entry);
    // Pending occurrences aren't real yet — excluded from the day's net.
    if (entry.kind === "transaction") group.net += netContribution(entry.transaction);
  }

  if (sortWithinDay !== "chronological") {
    for (const group of groups.values()) {
      group.entries.sort((a, b) => {
        const diff = Math.abs(a.amount) - Math.abs(b.amount);
        return sortWithinDay === "amountDesc" ? -diff : diff;
      });
    }
  }

  return Array.from(groups.values());
}

function formatDateHeader(
  date: Date,
  language: string,
  labels: { today: string; yesterday: string },
  style: "short" | "full",
): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const relative =
    date.toDateString() === new Date().toDateString()
      ? labels.today
      : date.toDateString() === yesterday.toDateString()
        ? labels.yesterday
        : null;
  if (style === "full") {
    const absolute = new Intl.DateTimeFormat(toIntlLocale(language), {
      weekday: "long",
      day: "numeric",
      month: "short",
    })
      .format(date)
      .replace(",", "")
      .replace(".", "");
    return relative ? `${relative} · ${absolute}` : absolute;
  }
  if (relative) return relative;
  try {
    return new Intl.DateTimeFormat(toIntlLocale(language), {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 py-2.5">
      <Skeleton className="size-[42px] shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-2/5 rounded-full" />
        <Skeleton className="h-3 w-1/3 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-20 rounded-full" />
    </div>
  );
}

export function TransactionList({
  transactions,
  occurrences = [],
  categories,
  wallets,
  onEditTransaction,
  onPayOccurrence,
  onCancelOccurrence,
  title,
  eyebrow,
  headerAction,
  emptyMessage,
  dateGroupOrder = "desc",
  dayHeaderStyle = "short",
  sortWithinDay = "chronological",
  isLoading = false,
}: TransactionListProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const resolvedTitle = title === undefined ? t("dashboard.recentTransactions") : title;
  const resolvedEmptyMessage = emptyMessage ?? t("dashboard.noTransactions");

  const entries = useMemo<ListEntry[]>(
    () => [
      ...transactions.map((transaction) => ({
        kind: "transaction" as const,
        date: transaction.date,
        amount: transaction.amount,
        transaction,
      })),
      ...occurrences.map((occurrence) => ({
        kind: "occurrence" as const,
        date: occurrence.dueDate,
        amount: occurrence.amount,
        occurrence,
      })),
    ],
    [transactions, occurrences],
  );

  const groups = useMemo(
    () => groupByDate(entries, dateGroupOrder, sortWithinDay),
    [entries, dateGroupOrder, sortWithinDay],
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

  const dayLabels = { today: t("transaction.today"), yesterday: t("dashboard.yesterday") };
  const isInitialLoading = isLoading && groups.length === 0;

  return (
    <div className="flex flex-col gap-1">
      {(resolvedTitle || headerAction) && (
        <SectionHead
          eyebrow={eyebrow}
          title={resolvedTitle}
          right={headerAction}
          className="mb-1"
        />
      )}

      {isInitialLoading ? (
        <div className="flex flex-col pt-2" aria-busy="true">
          <Skeleton className="mb-1 h-3 w-20 rounded-full" />
          {Array.from({ length: 4 }, (_, index) => (
            <RowSkeleton key={index} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState icon={<LuReceiptText />} title={resolvedEmptyMessage} className="mt-2" />
      ) : (
        <div
          className={cn("flex flex-col transition-opacity duration-300", isLoading && "opacity-60")}
          aria-busy={isLoading}
        >
          {groups.map((group) => (
            <div key={group.dateKey} className="flex animate-fade-in flex-col">
              <div className="flex items-center justify-between gap-3 pt-3.5 pb-0.5 text-[12px] text-text-3">
                <span className="truncate font-semibold tracking-[0.05em] uppercase">
                  {formatDateHeader(group.date, language, dayLabels, dayHeaderStyle)}
                </span>
                {group.net !== 0 && (
                  <span className="shrink-0 font-num tabular">
                    {group.net < 0 ? "−" : "+"}
                    {format(Math.abs(group.net))}
                  </span>
                )}
              </div>
              <div className="-mx-2 flex flex-col gap-0.5">
                {group.entries.map((entry) => {
                  if (entry.kind === "occurrence") {
                    const { occurrence } = entry;
                    return (
                      <div key={occurrence.idOccurrence} className="px-2 py-1">
                        <ScheduledTransactionRow
                          occurrence={occurrence}
                          category={resolveCategory(occurrence.idCategory)}
                          subCategory={resolveSubCategory(
                            occurrence.idCategory,
                            occurrence.idSubCategory,
                          )}
                          wallet={resolveWallet(occurrence.idWallet)}
                          onPay={() => onPayOccurrence?.(occurrence)}
                          onCancel={() => onCancelOccurrence?.(occurrence)}
                        />
                      </div>
                    );
                  }

                  const { transaction } = entry;
                  return transaction.type === "transfer" ? (
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
