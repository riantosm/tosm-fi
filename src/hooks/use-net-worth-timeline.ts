import { useEffect, useState } from "react";
import { investmentTransactionService } from "@/services/investment-transaction.service";
import { useLanguage } from "@/hooks/use-language";
import type {
  NetWorthTimelineGranularity,
  NetWorthTimelinePoint,
} from "@/types/investment-transaction.types";

export function useNetWorthTimeline(
  granularity: NetWorthTimelineGranularity,
  dateFrom: string,
  dateTo: string,
  idInstrument: string[],
) {
  const { language } = useLanguage();
  const [data, setData] = useState<NetWorthTimelinePoint[]>([]);
  const [completedKey, setCompletedKey] = useState<string | null>(null);

  const requestKey = JSON.stringify({ granularity, dateFrom, dateTo, idInstrument, language });
  const isLoading = completedKey !== requestKey;

  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    let cancelled = false;

    void investmentTransactionService
      .fetchNetWorthTimeline({ granularity, dateFrom, dateTo, locale: language, idInstrument })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setCompletedKey(requestKey);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load net worth timeline", error);
        setCompletedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return { data, isLoading };
}
