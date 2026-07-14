import { useEffect, useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";

/** Returns the "YYYY-MM" of the user's earliest transaction, or null once known there is none. */
export function useFirstTransactionMonth(): string | null {
  const { queryTransactions } = useTransactions();
  const [firstTransactionMonth, setFirstTransactionMonth] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void queryTransactions({ sort: "dateAsc", page: 1, limit: 1 }).then((result) => {
      if (cancelled) return;
      const firstDate = result.transactions[0]?.date;
      setFirstTransactionMonth(firstDate ? firstDate.slice(0, 7) : null);
    });

    return () => {
      cancelled = true;
    };
  }, [queryTransactions]);

  return firstTransactionMonth;
}
