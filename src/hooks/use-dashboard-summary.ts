import { useEffect, useRef, useState } from "react";
import { reportService } from "@/services/report.service";
import { useInstruments } from "@/hooks/use-instruments";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import type { DashboardSummary } from "@/types/report.types";

export function useDashboardSummary() {
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { instruments, status: instrumentsStatus, loadInstruments } = useInstruments();
  const { transactions } = useTransactions();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    if (instrumentsStatus === "idle") void loadInstruments();
  }, [instrumentsStatus, loadInstruments]);

  // Refetches whenever wallets, instruments, or the transaction change-signal changes
  // reference — covers wallet/instrument CRUD and every transaction or investment-transaction
  // mutation, the same trick DashboardPage already uses for its own month-scoped query. Only
  // the very first fetch flips isLoading — later ones (e.g. selecting a primary wallet, which
  // changes the `wallets` reference but none of the summary figures) refresh silently instead
  // of flashing the skeleton again.
  //
  // Debounced: wallets/instruments each settle via their own async load, so a fresh mount
  // naturally produces a burst of reference changes (idle -> loading -> loaded, sometimes more
  // than once — see WalletQuickSwitcher/DashboardPage each independently idle-checking the same
  // slice) in quick succession. Without debouncing, every change in that burst would fire its
  // own dashboard-summary request; this collapses the whole burst into a single fetch once
  // things settle for 200ms.
  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!hasLoadedRef.current) setIsLoading(true);

      void reportService
        .fetchDashboardSummary()
        .then((result) => {
          if (cancelled) return;
          setSummary(result);
          setIsLoading(false);
          hasLoadedRef.current = true;
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("Failed to load dashboard summary", error);
          setIsLoading(false);
          hasLoadedRef.current = true;
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [wallets, instruments, transactions]);

  return { summary, isLoading };
}
