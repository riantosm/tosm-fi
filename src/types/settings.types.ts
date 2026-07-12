import type { CurrencyCode, DecimalPlaces } from "@/types/currency.types";

export interface UserSettings {
  currency: CurrencyCode;
  decimalPlaces: DecimalPlaces;
  language: string;
}

export type SettingsInput = Partial<UserSettings>;
