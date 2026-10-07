import { useTranslation } from "react-i18next";
import { OptionRow } from "@/layouts/settings/OptionRow";
import { CURRENCIES } from "@/constants/currencies";
import { useCurrency } from "@/hooks/use-currency";

/** Tile glyph per currency ("Rp" reads better than the "IDR" display symbol). */
const TILE_GLYPH: Record<string, string> = { IDR: "Rp" };

export function CurrencyOptionList() {
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="radiogroup"
      aria-label={t("settingsCurrency.title")}
      className="flex flex-col gap-2.5"
    >
      {CURRENCIES.map((option) => (
        <OptionRow
          key={option.code}
          leading={TILE_GLYPH[option.code] ?? option.symbol}
          title={option.code}
          subtitle={t(`settingsCurrency.names.${option.code}`)}
          isSelected={option.code === currency}
          onSelect={() => setCurrency(option.code)}
        />
      ))}
    </div>
  );
}
