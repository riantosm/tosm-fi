import { useCallback, useState } from "react";
import { WALLET_VIEW_MODE_STORAGE_KEY } from "@/constants/storage-keys";

export type WalletViewMode = "grid" | "list";

function getInitialViewMode(): WalletViewMode {
  const stored = localStorage.getItem(WALLET_VIEW_MODE_STORAGE_KEY);
  return stored === "list" ? "list" : "grid";
}

export function useWalletViewMode() {
  const [viewMode, setViewModeState] = useState<WalletViewMode>(getInitialViewMode);

  const setViewMode = useCallback((mode: WalletViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(WALLET_VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode };
}
