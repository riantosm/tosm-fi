import { useCallback, useState } from "react";
import { INSTRUMENT_VIEW_MODE_STORAGE_KEY } from "@/constants/storage-keys";

export type InstrumentViewMode = "carousel" | "grid";

function getInitialViewMode(): InstrumentViewMode {
  const stored = localStorage.getItem(INSTRUMENT_VIEW_MODE_STORAGE_KEY);
  return stored === "grid" ? "grid" : "carousel";
}

export function useInstrumentViewMode() {
  const [viewMode, setViewModeState] = useState<InstrumentViewMode>(getInitialViewMode);

  const setViewMode = useCallback((mode: InstrumentViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(INSTRUMENT_VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode };
}
