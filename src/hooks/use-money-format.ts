import { useCallback } from "react";
import { CURRENCIES } from "@/constants/currencies";
import { useCurrency } from "@/hooks/use-currency";

/** Placeholder shown instead of an amount while "hide balance" is on. */
export const AMOUNT_MASK = "••••••••";

/**
 * Presentational money helpers on top of `useCurrency()`: the currency symbol
 * on its own (big "IDR" + number layouts), the bare number, a compact form for
 * tight spots and chart labels ("18,5 jt") and a signed form ("+9.260.000").
 */
export function useMoneyFormat() {
  const { currency, decimalPlaces, format } = useCurrency();
  const option = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];
  const { locale, symbol } = option;

  const formatNumber = useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(value),
    [locale, decimalPlaces],
  );

  const formatCompact = useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(
        value,
      ),
    [locale],
  );

  const formatSigned = useCallback(
    (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatNumber(Math.abs(value))}`,
    [formatNumber],
  );

  return { symbol, format, formatNumber, formatCompact, formatSigned };
}
