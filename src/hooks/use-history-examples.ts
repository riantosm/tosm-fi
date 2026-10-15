import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { useTransactions } from "@/hooks/use-transactions";
import { useAppSelector } from "@/redux";
import type { Transaction } from "@/types/transaction.types";
import { buildHistoryExamples, EXAMPLE_LOOKBACK_DAYS } from "@/utils/assistant-examples";
import { toIsoDate } from "@/utils/calendar";
import { toIntlLocale } from "@/utils/locale";

/**
 * Catat cepat "just tap" examples from the history: transactions that recur within the last 30
 * days ("Kopi 18rb pakai GoPay"). `null` = still analysing; an empty array = no pattern yet (the
 * panel uses the built-in examples). Wallets & categories are loaded by `chat.ensureData()`.
 */
export function useHistoryExamples(enabled: boolean): string[] | null {
  const { t } = useTranslation();
  const { language } = useLanguage();
  // `transactions` is the slice's "a mutation happened" signal → refetch after saves.
  const { queryTransactions, transactions: mutationSignal } = useTransactions();
  const wallets = useAppSelector((state) => state.wallet.wallets);
  const walletStatus = useAppSelector((state) => state.wallet.status);
  const categories = useAppSelector((state) => state.category.categories);
  const categoryStatus = useAppSelector((state) => state.category.status);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - (EXAMPLE_LOOKBACK_DAYS - 1));
    queryTransactions({ dateFrom: toIsoDate(from), dateTo: toIsoDate(today) })
      .then((result) => active && setTransactions(result.transactions))
      .catch(() => active && setTransactions([]));
    return () => {
      active = false;
    };
  }, [enabled, queryTransactions, mutationSignal]);

  return useMemo(() => {
    // Wait for wallet/category names so the examples don't change in front of the user.
    if (!transactions || walletStatus !== "loaded" || categoryStatus !== "loaded") return null;
    return buildHistoryExamples(transactions, wallets, categories, toIntlLocale(language)).map(
      (example) => {
        if (example.kind === "transfer") return t("assistant.historyTransfer", example);
        if (!example.wallet) return t("assistant.historyNoWallet", example);
        return t(
          example.kind === "income" ? "assistant.historyIncome" : "assistant.historyExpense",
          example,
        );
      },
    );
  }, [transactions, walletStatus, categoryStatus, wallets, categories, language, t]);
}
