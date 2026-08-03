import { useMemo } from "react";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { toIsoDateString } from "@/utils/report-period";
import { CURRENCIES } from "@/constants/currencies";
import { cn } from "@/utils/cn";
import type { Transaction } from "@/types/transaction.types";

interface TransactionCalendarProps {
  month: Date;
  transactions: Transaction[];
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
  isLoading?: boolean;
}

type DotTone = "positive" | "negative" | "neutral";

interface DayCell {
  day: number;
  date: Date;
  net: number;
  dots: DotTone[];
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

function buildWeekdayLabels(locale: string): string[] {
  const referenceSunday = new Date(2023, 0, 1);
  try {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(referenceSunday);
      date.setDate(referenceSunday.getDate() + index);
      return formatter.format(date);
    });
  } catch {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }
}

export function TransactionCalendar({
  month,
  transactions,
  selectedDay,
  onSelectDay,
  isLoading,
}: TransactionCalendarProps) {
  const { currency } = useCurrency();
  const { language } = useLanguage();

  const formatCompact = useMemo(() => {
    const option = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];
    const formatter = new Intl.NumberFormat(option.locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return (value: number) => `${option.symbol}${formatter.format(Math.abs(value))}`;
  }, [currency]);

  const weekdayLabels = useMemo(() => buildWeekdayLabels(language), [language]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const todayIso = toIsoDateString(new Date());

  const dayCells = useMemo<DayCell[]>(() => {
    const aggregates = new Map<number, { net: number; dots: DotTone[] }>();
    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      if (date.getFullYear() !== year || date.getMonth() !== monthIndex) continue;
      const day = date.getDate();
      const delta = netContribution(transaction);
      const existing = aggregates.get(day) ?? { net: 0, dots: [] };
      existing.net += delta;
      existing.dots.push(delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral");
      aggregates.set(day, existing);
    }

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const aggregate = aggregates.get(day) ?? { net: 0, dots: [] };
      return { day, date: new Date(year, monthIndex, day), net: aggregate.net, dots: aggregate.dots };
    });
  }, [transactions, year, monthIndex]);

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const totalCells = firstWeekday + dayCells.length;
  const trailingBlankCount = (7 - (totalCells % 7)) % 7;

  function handleSelect(cell: DayCell) {
    const iso = toIsoDateString(cell.date);
    onSelectDay(selectedDay === iso ? null : iso);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
      <div className="grid grid-cols-7 gap-1">
        {weekdayLabels.map((label) => (
          <Words
            key={label}
            type="xxs/bold"
            as="span"
            className="text-center uppercase tracking-wide text-ink-400 dark:text-ink-500"
          >
            {label}
          </Words>
        ))}
      </div>

      <div className={cn("grid grid-cols-7 gap-1", isLoading && "opacity-50")}>
        {Array.from({ length: firstWeekday }, (_, index) => (
          <div key={`lead-${index}`} />
        ))}

        {dayCells.map((cell) => {
          const iso = toIsoDateString(cell.date);
          const isSelected = selectedDay === iso;
          const isToday = iso === todayIso;
          const visibleDots = cell.dots.slice(0, 3);

          return (
            <button
              key={cell.day}
              type="button"
              onClick={() => handleSelect(cell)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-1 transition-colors",
                isSelected
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                  : isToday
                    ? "border-primary-400 dark:border-primary-600"
                    : "border-transparent hover:bg-ink-50 dark:hover:bg-ink-800",
              )}
            >
              <Words
                type="xs/bold"
                as="span"
                className={isSelected ? "text-primary-700 dark:text-primary-300" : "text-ink-900 dark:text-ink-50"}
              >
                {cell.day}
              </Words>

              {visibleDots.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {visibleDots.map((dot, index) => (
                    <span
                      key={index}
                      className={cn(
                        "h-1 w-1 rounded-full",
                        dot === "positive" && "bg-primary-500 dark:bg-primary-400",
                        dot === "negative" && "bg-red-500 dark:bg-red-400",
                        dot === "neutral" && "bg-ink-400 dark:bg-ink-600",
                      )}
                    />
                  ))}
                </div>
              )}

              {cell.net !== 0 && (
                <Words
                  type="xxs/bold"
                  as="span"
                  className={cn(
                    "truncate leading-none",
                    cell.net > 0 ? "text-primary-600 dark:text-primary-400" : "text-red-500 dark:text-red-400",
                  )}
                >
                  {formatCompact(cell.net)}
                </Words>
              )}
            </button>
          );
        })}

        {Array.from({ length: trailingBlankCount }, (_, index) => (
          <div key={`trail-${index}`} />
        ))}
      </div>
    </div>
  );
}
