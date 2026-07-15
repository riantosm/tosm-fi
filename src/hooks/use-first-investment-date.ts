import { useEffect, useState } from "react";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";

/** Returns the "YYYY-MM-DD" of the user's earliest investment transaction, or null once known there is none. */
export function useFirstInvestmentDate(): string | null {
  const { queryInvestmentTransactions } = useInvestmentTransactions();
  const [firstInvestmentDate, setFirstInvestmentDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void queryInvestmentTransactions({ sort: "dateAsc", page: 1, limit: 1 }).then((result) => {
      if (cancelled) return;
      const firstDate = result.investmentTransactions[0]?.date;
      setFirstInvestmentDate(firstDate ? firstDate.slice(0, 10) : null);
    });

    return () => {
      cancelled = true;
    };
  }, [queryInvestmentTransactions]);

  return firstInvestmentDate;
}
