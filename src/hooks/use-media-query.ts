import { useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

/** Live `matchMedia` result, e.g. `useMediaQuery("(min-width: 1024px)")`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Desktop shell breakpoint — rail + desktop headers from 1024px up. */
export const DESKTOP_QUERY = "(min-width: 1024px)";
/** Below this, dialogs render as bottom sheets. */
export const SHEET_QUERY = "(max-width: 639px)";
