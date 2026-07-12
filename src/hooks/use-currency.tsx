import { useCallback } from "react";
import { CURRENCIES } from "@/constants/currencies";
import { useSettings } from "@/hooks/use-settings";
import type { CurrencyCode, DecimalPlaces } from "@/types/currency.types";

export function useCurrency() {
  const { currency, decimalPlaces, updateSettings } = useSettings();

  const setCurrency = useCallback(
    (code: CurrencyCode) => {
      void updateSettings({ currency: code });
    },
    [updateSettings],
  );

  const setDecimalPlaces = useCallback(
    (places: DecimalPlaces) => {
      void updateSettings({ decimalPlaces: places });
    },
    [updateSettings],
  );

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

  return { currency, setCurrency, decimalPlaces, setDecimalPlaces, format };
}
