import { useTranslation } from "react-i18next";
import { HiCheck } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { CURRENCIES } from "@/constants/currencies";
import { DECIMAL_OPTIONS } from "@/constants/decimal-options";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/utils/cn";

export function DecimalOptionList() {
  const { t } = useTranslation();
  const { currency, decimalPlaces, setDecimalPlaces } = useCurrency();
  const currentCurrency = CURRENCIES.find((option) => option.code === currency) ?? CURRENCIES[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
      <div className="divide-y divide-ink-100 dark:divide-ink-800">
        {DECIMAL_OPTIONS.map((option) => {
          const isActive = option === decimalPlaces;
          const preview = new Intl.NumberFormat(currentCurrency.locale, {
            minimumFractionDigits: option,
            maximumFractionDigits: option,
          }).format(10000);

          return (
            <button
              key={option}
              type="button"
              onClick={() => setDecimalPlaces(option)}
              className={cn(
                "flex w-full items-center gap-3 bg-white px-4 py-3 text-left transition-colors dark:bg-ink-900",
                isActive
                  ? "text-primary-700 dark:text-primary-400"
                  : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800",
              )}
            >
              <div className="flex flex-1 flex-col">
                <Words type="sm/bold" as="span" className="font-mono">
                  {preview}
                </Words>
                <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                  {t(`settingsCurrency.decimalOptions.${option}`)}
                </Words>
              </div>
              {isActive && <HiCheck className="h-5 w-5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
