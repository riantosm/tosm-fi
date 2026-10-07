import { useTranslation } from "react-i18next";
import { OptionRow } from "@/layouts/settings/OptionRow";
import { CURRENCIES } from "@/constants/currencies";
import { DECIMAL_OPTIONS } from "@/constants/decimal-options";
import { useCurrency } from "@/hooks/use-currency";

const PREVIEW_AMOUNT = 1250000.5;

export function DecimalOptionList() {
  const { t } = useTranslation();
  const { currency, decimalPlaces, setDecimalPlaces, format } = useCurrency();
  const currentCurrency = CURRENCIES.find((option) => option.code === currency) ?? CURRENCIES[0];

  return (
    <div className="flex flex-col gap-2.5">
      <div
        role="radiogroup"
        aria-label={t("settingsCurrency.decimalTitle")}
        className="flex flex-col gap-2.5"
      >
        {DECIMAL_OPTIONS.map((option) => {
          const sample = new Intl.NumberFormat(currentCurrency.locale, {
            minimumFractionDigits: option,
            maximumFractionDigits: option,
          }).format(option === 0 ? Math.floor(PREVIEW_AMOUNT) : PREVIEW_AMOUNT);
          return (
            <OptionRow
              key={option}
              leading={option}
              title={t(`settingsCurrency.decimalOptions.${option}`)}
              subtitle={`${currentCurrency.symbol} ${sample}`}
              isSelected={option === decimalPlaces}
              onSelect={() => setDecimalPlaces(option)}
            />
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1 rounded-control border border-border px-4 py-3.5">
        <span className="text-[12px] text-text-3">{t("settingsCurrency.preview")}</span>
        <span
          key={`${currency}-${decimalPlaces}`}
          className="animate-fade-in font-num text-[22px] font-semibold text-text tabular"
        >
          {format(Math.floor(PREVIEW_AMOUNT))}
        </span>
      </div>
    </div>
  );
}
