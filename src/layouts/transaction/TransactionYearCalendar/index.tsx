import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LuCalendarDays } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/molecules/Card";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import type { TransactionSummary } from "@/types/transaction.types";
import { formatMonthName } from "@/utils/calendar";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";
import { formatMonthParam, isSameMonthAs } from "@/utils/month";

export interface YearMonthSummary {
  /** First day of the month. */
  month: Date;
  summary: TransactionSummary;
  count: number;
}

interface TransactionYearCalendarProps {
  year: number;
  /** Twelve entries (Jan–Dec) once loaded; empty while the first fetch is in flight. */
  months: YearMonthSummary[];
  /** "YYYY-MM" of the month the list is filtered to, if any. */
  selectedMonth: string | null;
  onSelectMonth: (month: string | null) => void;
  /** Switches back to the month view, on that month. */
  onOpenMonth: (month: Date) => void;
  isLoading?: boolean;
}

/** Year grid of monthly activity: tap a month to filter the list to it (tap again to clear). */
export function TransactionYearCalendar({
  year,
  months,
  selectedMonth,
  onSelectMonth,
  onOpenMonth,
  isLoading,
}: TransactionYearCalendarProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const { formatCompact } = useMoneyFormat();
  const today = new Date();

  const slots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = new Date(year, index, 1);
        const key = formatMonthParam(month);
        return { month, key, data: months.find((item) => isSameMonthAs(item.month, month)) };
      }),
    [year, months],
  );
  // Each month's expense bar is scaled against the year's biggest spending month.
  const maxExpense = Math.max(1, ...months.map((item) => item.summary.expense));
  const selectedSlot = slots.find((slot) => slot.key === selectedMonth);

  const signedCompact = (value: number) =>
    `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatCompact(Math.abs(value))}`;

  return (
    <Card className="flex flex-col gap-2.5 p-4 sm:p-5 lg:p-6">
      <div className="flex min-h-8 items-center justify-between gap-3 lg:pb-1.5">
        <h2 className="hidden font-display text-[18px] font-semibold text-text lg:block">{year}</h2>
        {selectedSlot ? (
          <Button
            type="button"
            size="sm"
            variant="soft"
            leftIcon={<LuCalendarDays />}
            onClick={() => onOpenMonth(selectedSlot.month)}
            className="ml-auto"
          >
            {t("transaction.openMonthCalendar", {
              month: formatMonthName(selectedSlot.month, locale),
            })}
          </Button>
        ) : (
          <span className="ml-auto text-[12.5px] text-text-3">
            {t("transaction.yearCalendarHint")}
          </span>
        )}
      </div>

      <div
        className={cn(
          "grid grid-cols-3 gap-1.5 transition-opacity duration-300 lg:gap-2 xl:grid-cols-4",
          isLoading && "opacity-50",
        )}
      >
        {slots.map(({ month, key, data }) => {
          const isSelected = selectedMonth === key;
          const isCurrent = isSameMonthAs(month, today);
          const isFuture = month > today;
          const summary = data?.summary;
          const hasActivity = Boolean(data && data.count > 0);
          const net = summary?.net ?? 0;
          const expense = summary?.expense ?? 0;
          const expenseTotal = summary?.categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectMonth(isSelected ? null : key)}
              aria-pressed={isSelected}
              aria-label={new Intl.DateTimeFormat(locale, {
                month: "long",
                year: "numeric",
              }).format(month)}
              className={cn(
                "flex flex-col justify-between gap-1.5 rounded-control border-2 px-2.5 py-2 text-left transition-[background-color,border-color,transform] duration-200",
                "h-[78px] lg:h-[112px] lg:px-3 lg:py-2.5",
                // Selected = solid primary block; this month = primary outline only.
                isSelected
                  ? "border-primary bg-primary"
                  : isCurrent
                    ? "border-primary bg-surface-2"
                    : cn(
                        "border-transparent hover:-translate-y-px",
                        hasActivity
                          ? "bg-surface-2 hover:bg-surface-3"
                          : "bg-bg hover:bg-surface-2",
                      ),
              )}
            >
              <span className="flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "truncate text-[13px] first-letter:uppercase lg:text-[13.5px]",
                    isSelected
                      ? "font-semibold text-primary-fg"
                      : isCurrent
                        ? "font-semibold text-primary-text"
                        : isFuture && !hasActivity
                          ? "font-medium text-text-3"
                          : "font-medium text-text",
                  )}
                >
                  <span className="lg:hidden">
                    {new Intl.DateTimeFormat(locale, { month: "short" })
                      .format(month)
                      .replace(".", "")}
                  </span>
                  <span className="hidden lg:inline">{formatMonthName(month, locale)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  {hasActivity && (
                    <span
                      className={cn(
                        "hidden font-num text-[11.5px] tabular lg:inline",
                        isSelected ? "text-primary-fg/75" : "text-text-3",
                      )}
                    >
                      {data?.count}
                    </span>
                  )}
                  {isCurrent && (
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        isSelected ? "bg-primary-fg" : "bg-primary",
                      )}
                      aria-label={t("transaction.goToCurrentMonth")}
                    />
                  )}
                </span>
              </span>

              {hasActivity ? (
                <span className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      "truncate font-num text-[12.5px] leading-none font-semibold tabular lg:text-[15px]",
                      isSelected
                        ? "text-primary-fg"
                        : net > 0
                          ? "text-income-text"
                          : net < 0
                            ? "text-expense-text"
                            : "text-text-3",
                    )}
                  >
                    {signedCompact(net)}
                  </span>
                  <span
                    className={cn(
                      "hidden gap-2 font-num text-[11.5px] leading-none tabular lg:flex",
                      isSelected ? "text-primary-fg/75" : "text-text-3",
                    )}
                  >
                    <span className="truncate">↑ {formatCompact(summary?.income ?? 0)}</span>
                    <span className="truncate">↓ {formatCompact(expense)}</span>
                  </span>
                  {/* Expense bar: length = share of the year's peak month, split by category. */}
                  <span
                    className={cn(
                      "flex h-[5px] w-full overflow-hidden rounded-full lg:h-1.5",
                      isSelected ? "bg-primary-fg/25" : "bg-surface-3",
                    )}
                  >
                    <span
                      className="flex h-full overflow-hidden rounded-full"
                      style={{ width: `${(expense / maxExpense) * 100}%` }}
                    >
                      {summary?.categoryBreakdown.map((category) => (
                        <span
                          key={category.idCategory}
                          className="h-full"
                          style={{
                            width: `${(category.amount / (expenseTotal || 1)) * 100}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      ))}
                    </span>
                  </span>
                </span>
              ) : (
                <span className="text-[12px] leading-none text-text-3/70">—</span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
