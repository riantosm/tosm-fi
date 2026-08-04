import { useEffect, useRef, useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { getCurrentMonthRange } from "@/utils/budget-breakdown";
import type { TransactionCategoryBreakdown } from "@/types/transaction.types";

/**
 * Fetches the current month's real expense breakdown once, shared by every
 * budget card/detail view — avoids one `queryTransactions` call per budget.
 * Refetches whenever `transactions` (the app-wide mutation-signal array from
 * `useTransactions`) changes reference, i.e. after any transaction
 * create/edit/delete anywhere in the app.
 */
export function useBudgetSpending() {
  const { transactions, queryTransactions } = useTransactions();
  const [categoryBreakdown, setCategoryBreakdown] = useState<TransactionCategoryBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const { dateFrom, dateTo } = getCurrentMonthRange();

    if (!hasLoadedRef.current) setIsLoading(true);

    void queryTransactions({ dateFrom, dateTo, type: "expense" })
      .then((result) => {
        if (cancelled) return;
        setCategoryBreakdown(result.summary.categoryBreakdown);
        setIsLoading(false);
        hasLoadedRef.current = true;
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load budget spending", error);
        setIsLoading(false);
        hasLoadedRef.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [queryTransactions, transactions]);

  return { categoryBreakdown, isLoading };
}
