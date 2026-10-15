import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Theme, ThemePreference } from "@/types/theme.types";
import { THEME_STORAGE_KEY } from "@/constants/storage-keys";

interface ThemeContextValue {
  /** Theme actually shown (the OS scheme when the preference is "system"). */
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Sun/moon buttons: switch to the opposite of what is shown, as an explicit choice. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

function getInitialPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [systemTheme, setSystemTheme] = useState<Theme>(() =>
    window.matchMedia(DARK_QUERY).matches ? "dark" : "light",
  );
  const theme = preference === "system" ? systemTheme : preference;

  // Track the OS scheme live so "system" switches without a reload.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    const root = document.documentElement;
    // Briefly enable color transitions on every element so switching themes
    // cross-fades instead of snapping; removed right after so normal
    // interactions keep their own (faster) transitions.
    root.classList.add("theme-switching");
    root.classList.toggle("dark", theme === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#25263a" : "#f4f5fb");
    const timeout = window.setTimeout(() => root.classList.remove("theme-switching"), 450);
    return () => window.clearTimeout(timeout);
  }, [theme]);

  const setPreference = useCallback((next: ThemePreference) => setPreferenceState(next), []);
  const toggleTheme = useCallback(
    () => setPreferenceState(theme === "dark" ? "light" : "dark"),
    [theme],
  );

  const value = useMemo(
    () => ({ theme, preference, setPreference, toggleTheme }),
    [theme, preference, setPreference, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme harus dipakai di dalam ThemeProvider");
  return context;
}
