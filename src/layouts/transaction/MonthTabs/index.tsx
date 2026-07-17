import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { useLanguage } from "@/hooks/use-language";
import { isSameMonthAs } from "@/utils/month";
import { cn } from "@/utils/cn";

interface MonthTabsProps {
  months: Date[];
  selected: Date;
  onSelect: (date: Date) => void;
}

function formatMonthLabel(date: Date, locale: string): string {
  const label = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  const currentYear = new Date().getFullYear();
  return date.getFullYear() === currentYear
    ? label
    : `${label} '${String(date.getFullYear()).slice(-2)}`;
}

export function MonthTabs({ months, selected, onSelect }: MonthTabsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const isFirstCenter = useRef(true);

  function centerSelected(behavior: ScrollBehavior) {
    selectedRef.current?.scrollIntoView({ behavior, inline: "center", block: "nearest" });
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
    <div className="flex items-start gap-1">
      <Tooltip content={t("common.previous")}>
        <button
          type="button"
          onClick={() => scrollByAmount(-240)}
          aria-label={t("common.previous")}
          className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500 transition-colors hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700"
        >
          <HiOutlineChevronLeft className="h-4 w-4" />
        </button>
      </Tooltip>

      <div
        ref={containerRef}
        className="flex flex-1 gap-6 overflow-x-auto px-1 scrollbar-hide"
      >
        {months.map((month) => {
          const isSelected = isSameMonthAs(month, selected);

          return (
            <button
              key={month.toISOString()}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => onSelect(month)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <Words
                type={isSelected ? "base/bold" : "base/regular"}
                as="span"
                className={cn(
                  "whitespace-nowrap transition-colors",
                  isSelected ? "text-ink-900 dark:text-white" : "text-ink-400 dark:text-ink-600",
                )}
              >
                {formatMonthLabel(month, language)}
              </Words>
              <span
                className={cn(
                  "h-0.5 w-full rounded-full transition-colors",
                  isSelected ? "bg-primary-500" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <Tooltip content={t("common.next")}>
        <button
          type="button"
          onClick={() => scrollByAmount(240)}
          aria-label={t("common.next")}
          className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500 transition-colors hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700"
        >
          <HiOutlineChevronRight className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  );
}
