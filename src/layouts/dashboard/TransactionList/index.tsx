import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/Button";
import { IconPlus } from "@/components/atoms/Icons";
import { Words } from "@/components/atoms/Words";
import { TransactionRow } from "@/components/molecules/TransactionRow";
import type { Transaction } from "@/types/dashboard.types";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="mb-2 flex items-center justify-between">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-100">
          {t("dashboard.recentTransactions")}
        </Words>
        <Button variant="secondary" className="!px-3 !py-1.5">
          <IconPlus className="h-3.5 w-3.5" />
          <Words type="xs/bold" as="span">
            {t("dashboard.addTransaction")}
          </Words>
        </Button>
      </div>
      <div className="divide-y divide-ink-100 dark:divide-ink-800">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
