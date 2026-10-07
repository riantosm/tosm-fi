import { useId, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LuCalendarCheck, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { useLanguage } from "@/hooks/use-language";
import { isSameMonthAs } from "@/utils/month";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";

interface MonthTabsProps {
  months: Date[];
  selected: Date;
  onSelect: (date: Date) => void;
  /** "Bulan ini" shortcut. */
  onGoToCurrent?: () => void;
}

function formatMonthLabel(date: Date, locale: string, withYear: boolean): string {
  const label = new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(".", "");
  return withYear ? `${label} ${date.getFullYear()}` : label;
}

/** Scrollable month strip with a sliding primary pill (design 04 · MonthTabs). */
export function MonthTabs({ months, selected, onSelect, onGoToCurrent }: MonthTabsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const thumbId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const isFirstCenter = useRef(true);
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = isSameMonthAs(selected, new Date());

  function centerSelected(behavior: ScrollBehavior) {
    const container = containerRef.current;
    const target = selectedRef.current;
    if (!container || !target) return;
    const left = target.offsetLeft - container.clientWidth / 2 + target.clientWidth / 2;
    container.scrollTo({ left, behavior });
  }

  useLayoutEffect(() => {
    centerSelected(isFirstCenter.current ? "auto" : "smooth");
    isFirstCenter.current = false;
  }, [selected]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => centerSelected("auto"));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  function scrollByAmount(amount: number) {
    containerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="flex items-center gap-2">
      <IconButton
        label={t("common.previous")}
        icon={<LuChevronLeft />}
        variant="surface"
        size="sm"
        className="hidden lg:inline-flex"
        onClick={() => scrollByAmount(-360)}
      />

      <div
        ref={containerRef}
        className="relative flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-full bg-surface p-1 shadow-card scrollbar-hide"
      >
        {months.map((month) => {
          const isSelected = isSameMonthAs(month, selected);
          return (
            <button
              key={month.toISOString()}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(month)}
              className={cn(
                "relative flex h-[34px] min-w-[68px] shrink-0 flex-1 items-center justify-center rounded-full px-3 text-[13px] whitespace-nowrap transition-colors duration-200 lg:min-w-[104px]",
                isSelected
                  ? "font-semibold text-primary-fg"
                  : "font-medium text-text-2 hover:bg-surface-2 hover:text-text",
              )}
            >
              {isSelected && (
                <m.span
                  layoutId={`month-${thumbId}`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-primary shadow-[0_4px_12px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative z-10">
                {formatMonthLabel(month, locale, isSelected || month.getFullYear() !== currentYear)}
              </span>
            </button>
          );
        })}
      </div>

      <IconButton
        label={t("common.next")}
        icon={<LuChevronRight />}
        variant="surface"
        size="sm"
        className="hidden lg:inline-flex"
        onClick={() => scrollByAmount(360)}
      />

      {onGoToCurrent && (
        <Button
          type="button"
          size="sm"
          variant="soft"
          leftIcon={<LuCalendarCheck />}
          onClick={onGoToCurrent}
          className={cn("shrink-0", isCurrentMonth && "max-lg:hidden")}
        >
          {t("transaction.goToCurrentMonth")}
        </Button>
      )}
    </div>
  );
}
