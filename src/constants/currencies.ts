import type { CurrencyCode } from "@/types/currency.types";

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "IDR", symbol: "IDR", locale: "id-ID" },
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "JPY", symbol: "¥", locale: "ja-JP" },
];
