import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENCIES } from "@/constants/currencies";
import { DECIMAL_OPTIONS } from "@/constants/decimal-options";
import { CURRENCY_STORAGE_KEY, DECIMAL_PLACES_STORAGE_KEY } from "@/constants/storage-keys";
import type { CurrencyCode, DecimalPlaces } from "@/types/currency.types";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  decimalPlaces: DecimalPlaces;
  setDecimalPlaces: (places: DecimalPlaces) => void;
  format: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function getInitialCurrency(): CurrencyCode {
  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return CURRENCIES.some((option) => option.code === stored) ? (stored as CurrencyCode) : "IDR";
}

function getInitialDecimalPlaces(): DecimalPlaces {
  const stored = Number(localStorage.getItem(DECIMAL_PLACES_STORAGE_KEY));
  return DECIMAL_OPTIONS.includes(stored as DecimalPlaces) ? (stored as DecimalPlaces) : 0;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency);
  const [decimalPlaces, setDecimalPlacesState] = useState<DecimalPlaces>(getInitialDecimalPlaces);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  }, []);

  const setDecimalPlaces = useCallback((places: DecimalPlaces) => {
    setDecimalPlacesState(places);
    localStorage.setItem(DECIMAL_PLACES_STORAGE_KEY, String(places));
  }, []);

  const format = useCallback(
    (value: number) => {
      const option = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];
      const number = new Intl.NumberFormat(option.locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(value);
      return `${option.symbol} ${number}`;
    },
    [currency, decimalPlaces],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, decimalPlaces, setDecimalPlaces, format }),
    [currency, setCurrency, decimalPlaces, setDecimalPlaces, format],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency harus dipakai di dalam CurrencyProvider");
  return context;
}
