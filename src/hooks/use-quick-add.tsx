import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface QuickAddContextValue {
  /** Catat Cepat (AI chat) panel / screen. */
  isAssistantOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  /** Manual entry — the classic AddTransaction form, mounted once in the app shell. */
  isManualOpen: boolean;
  openManualEntry: () => void;
  closeManualEntry: () => void;
  /** Phone "Lainnya" sheet. */
  isMoreOpen: boolean;
  setMoreOpen: (open: boolean) => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [isManualOpen, setManualOpen] = useState(false);
  const [isMoreOpen, setMoreOpen] = useState(false);

  const openAssistant = useCallback(() => {
    setMoreOpen(false);
    setAssistantOpen(true);
  }, []);
  const closeAssistant = useCallback(() => setAssistantOpen(false), []);
  const openManualEntry = useCallback(() => {
    setMoreOpen(false);
    setManualOpen(true);
  }, []);
  const closeManualEntry = useCallback(() => setManualOpen(false), []);

  const value = useMemo(
    () => ({
      isAssistantOpen,
      openAssistant,
      closeAssistant,
      isManualOpen,
      openManualEntry,
      closeManualEntry,
      isMoreOpen,
      setMoreOpen,
    }),
    [
      isAssistantOpen,
      openAssistant,
      closeAssistant,
      isManualOpen,
      openManualEntry,
      closeManualEntry,
      isMoreOpen,
    ],
  );

  return <QuickAddContext.Provider value={value}>{children}</QuickAddContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuickAdd(): QuickAddContextValue {
  const context = useContext(QuickAddContext);
  if (!context) throw new Error("useQuickAdd harus dipakai di dalam QuickAddProvider");
  return context;
}
