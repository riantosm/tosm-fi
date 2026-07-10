import { useTranslation } from "react-i18next";
import { HiCheck } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { CURRENCIES } from "@/constants/currencies";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/utils/cn";

export function CurrencyOptionList() {
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
      <div className="divide-y divide-ink-100 dark:divide-ink-800">
        {CURRENCIES.map((option) => {
          const isActive = option.code === currency;

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => setCurrency(option.code)}
              className={cn(
                "flex w-full items-center gap-3 bg-white px-4 py-3 text-left transition-colors dark:bg-ink-900",
                isActive
                  ? "text-primary-700 dark:text-primary-400"
                  : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 font-mono text-sm font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                {option.symbol}
              </span>
              <div className="flex flex-1 flex-col">
                <Words type="sm/bold" as="span">
                  {option.code}
                </Words>
                <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                  {t(`settingsCurrency.names.${option.code}`)}
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
