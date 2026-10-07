import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/molecules/Card";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import type { Category } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";
import { buildMonthWeeks, formatMonthYear, getWeekdayLabels, toIsoDate } from "@/utils/calendar";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";

interface TransactionCalendarProps {
  month: Date;
  transactions: Transaction[];
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
  isLoading?: boolean;
  /** Colors the day dots by category (falls back to income/expense tones). */
  categories?: Category[];
}

interface DayAggregate {
  net: number;
  dots: string[];
}

// Correction's `amount` is already a signed delta (per the transaction
// backend), so it contributes directly like income; transfer never affects
// net since it just moves money between the user's own wallets.
function netContribution(transaction: Transaction): number {
  switch (transaction.type) {
    case "income":
      return transaction.amount;
    case "expense":
      return -transaction.amount;
    case "correction":
      return transaction.amount;
    default:
      return 0;
  }
}

const TONE_DOT = {
  positive: "var(--income)",
  negative: "var(--expense)",
  neutral: "var(--text-3)",
};

/** Month grid of daily activity: tap a day to filter the list to it (tap again to clear). */
export function TransactionCalendar({
  month,
  transactions,
  selectedDay,
  onSelectDay,
  isLoading,
  categories = [],
}: TransactionCalendarProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const { formatCompact } = useMoneyFormat();

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const todayIso = toIsoDate(new Date());
  const weeks = useMemo(() => buildMonthWeeks(year, monthIndex), [year, monthIndex]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const narrowLabels = useMemo(() => getWeekdayLabels(locale, "narrow"), [locale]);

  const aggregates = useMemo(() => {
    const colorOf = new Map(categories.map((category) => [category.idCategory, category.color]));
    const map = new Map<string, DayAggregate>();
    for (const transaction of transactions) {
      const iso = toIsoDate(new Date(transaction.date));
      const delta = netContribution(transaction);
      const entry = map.get(iso) ?? { net: 0, dots: [] };
      entry.net += delta;
      const tone = delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral";
      entry.dots.push(
        (transaction.idCategory && colorOf.get(transaction.idCategory)) || TONE_DOT[tone],
      );
      map.set(iso, entry);
    }
    return map;
  }, [transactions, categories]);

  function toggle(iso: string) {
    onSelectDay(selectedDay === iso ? null : iso);
  }

  const signedCompact = (value: number) =>
    `${value > 0 ? "+" : "−"}${formatCompact(Math.abs(value))}`;

  return (
    <Card className="flex flex-col gap-2.5 p-4 sm:p-5 lg:p-6">
      <div className="hidden items-center justify-between gap-3 pb-1.5 lg:flex">
        <h2 className="font-display text-[18px] font-semibold text-text first-letter:uppercase">
          {formatMonthYear(month, locale)}
        </h2>
        <span className="text-[12.5px] text-text-3">{t("transaction.calendarHint")}</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekdayLabels.map((label, index) => (
          <span key={label + index} className="text-center text-[12px] font-semibold text-text-3">
            <span className="lg:hidden">{narrowLabels[index]}</span>
            <span className="hidden lg:inline">{label.replace(".", "")}</span>
          </span>
        ))}
      </div>

      <div
        className={cn(
          "flex flex-col gap-1 transition-opacity duration-300 lg:gap-1.5",
          isLoading && "opacity-50",
        )}
      >
        {weeks.map((week) => (
          <div key={week[0].iso} className="grid grid-cols-7 gap-1.5">
            {week.map((day) => {
              if (!day.inMonth) {
                return (
                  <span
                    key={day.iso}
                    className="flex h-11 items-start justify-center pt-2.5 font-num text-[13.5px] text-text-3/60 lg:h-[86px] lg:justify-start lg:px-2.5 lg:pt-2"
                  >
                    {day.date.getDate()}
                  </span>
                );
              }
              const aggregate = aggregates.get(day.iso);
              const isSelected = selectedDay === day.iso;
              const isToday = day.iso === todayIso;
              const dots = aggregate?.dots.slice(0, 3) ?? [];

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => toggle(day.iso)}
                  aria-pressed={isSelected}
                  aria-label={day.date.toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                  })}
                  className={cn(
                    "group relative flex flex-col items-center gap-1 rounded-full transition-[background-color,border-color,transform] duration-200",
                    "h-11 pt-1 lg:h-[86px] lg:items-stretch lg:justify-between lg:rounded-control lg:border-2 lg:px-2.5 lg:py-2",
                    isSelected
                      ? "lg:border-primary lg:bg-primary-soft"
                      : isToday
                        ? "lg:border-primary lg:bg-surface-2"
                        : cn(
                            "lg:border-transparent lg:hover:-translate-y-px",
                            aggregate
                              ? "lg:bg-surface-2 lg:hover:bg-surface-3"
                              : "lg:bg-bg lg:hover:bg-surface-2",
                          ),
                  )}
                >
                  {/* Phone: day circle */}
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full font-num text-[13.5px] transition-colors duration-200 lg:hidden",
                      isToday
                        ? "bg-primary font-semibold text-primary-fg"
                        : isSelected
                          ? "bg-primary-soft font-semibold text-primary-text ring-2 ring-primary"
                          : "font-medium text-text group-hover:bg-surface-2",
                      isToday &&
                        isSelected &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-surface",
                    )}
                  >
                    {day.date.getDate()}
                  </span>

                  {/* Desktop: number + today badge */}
                  <span className="hidden items-center justify-between gap-1 lg:flex">
                    <span
                      className={cn(
                        "font-num text-[13.5px]",
                        isToday || isSelected
                          ? "font-semibold text-primary-text"
                          : "font-medium text-text",
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                    {isToday && (
                      <>
                        <span className="hidden truncate rounded-full bg-primary px-1.5 text-[10px] leading-[14px] font-semibold text-primary-fg xl:inline">
                          {t("transaction.today")}
                        </span>
                        <span
                          className="size-2 rounded-full bg-primary xl:hidden"
                          aria-label={t("transaction.today")}
                        />
                      </>
                    )}
                  </span>

                  {dots.length > 0 && (
                    <span className="flex flex-col items-center gap-1 lg:items-start">
                      <span className="flex gap-[3px]">
                        {dots.map((color, index) => (
                          <span
                            key={index}
                            className="size-[5px] rounded-full lg:size-[7px]"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </span>
                      {aggregate && aggregate.net !== 0 && (
                        <span
                          className={cn(
                            "hidden max-w-full truncate font-num text-[12px] leading-none font-semibold tabular lg:block",
                            aggregate.net > 0 ? "text-income-text" : "text-expense-text",
                          )}
                        >
                          {signedCompact(aggregate.net)}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
