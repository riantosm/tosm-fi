import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCalendarDays, HiOutlineChevronLeft } from "react-icons/hi2";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import { DateTimePickerFields } from "@/layouts/transaction/DateTimePickerModal";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";

export interface DateRangeFilter {
  from: string;
  to: string;
}

type ActiveField = "from" | "to" | null;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string, locale: string): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
      parseIsoDate(value),
    );
  } catch {
    return value;
  }
}

interface DateRangeFilterPopoverProps {
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
}

export function DateRangeFilterPopover({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterPopoverProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [draftRange, setDraftRange] = useState<DateRangeFilter>(dateRange);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasDateFilter = Boolean(dateRange.from || dateRange.to);
  const hasDraftChanges =
    draftRange.from !== dateRange.from || draftRange.to !== dateRange.to;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveField(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function togglePopover() {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setDraftRange(dateRange);
      return next;
    });
  }

  function applyDraft() {
    onDateRangeChange(draftRange);
    setIsOpen(false);
  }

  function clearFilter() {
    setDraftRange({ from: "", to: "" });
    onDateRangeChange({ from: "", to: "" });
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={togglePopover}
        aria-label={t("transaction.dateFilterTitle")}
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          hasDateFilter
            ? "bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400"
            : "bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700",
        )}
      >
        <HiOutlineCalendarDays className="h-4 w-4" />
        {hasDateFilter && (
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-primary-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-ink-200 bg-white p-4 shadow-lg dark:border-ink-800 dark:bg-ink-900">
          {activeField ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="flex items-center gap-1 self-start text-ink-500 dark:text-ink-400"
              >
                <HiOutlineChevronLeft className="h-4 w-4" />
                <Words type="xs/bold" as="span">
                  {t("common.back")}
                </Words>
              </button>
              <DateTimePickerFields
                dateOnly
                value={parseIsoDate(activeField === "from" ? draftRange.from : draftRange.to)}
                title={activeField === "from" ? t("transaction.dateFrom") : t("transaction.dateTo")}
                onClose={() => setActiveField(null)}
                onConfirm={(date) => {
                  setDraftRange((prev) => ({ ...prev, [activeField]: toIsoDate(date) }));
                  setActiveField(null);
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Words
                type="xs/bold"
                className="uppercase tracking-wide text-ink-400 dark:text-ink-500"
              >
                {t("transaction.dateFilterTitle")}
              </Words>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setActiveField("from")}
                  className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800"
                >
                  <Words type="xs/regular" className="text-ink-500 dark:text-ink-400">
                    {t("transaction.dateFrom")}
                  </Words>
                  <Words type="sm/bold" as="span" className="text-ink-900 dark:text-ink-50">
                    {formatDisplayDate(draftRange.from, language)}
                  </Words>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveField("to")}
                  className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800"
                >
                  <Words type="xs/regular" className="text-ink-500 dark:text-ink-400">
                    {t("transaction.dateTo")}
                  </Words>
                  <Words type="sm/bold" as="span" className="text-ink-900 dark:text-ink-50">
                    {formatDisplayDate(draftRange.to, language)}
                  </Words>
                </button>
              </div>

              <Button
                type="button"
                onClick={applyDraft}
                disabled={!hasDraftChanges}
                className="w-full"
              >
                <Words type="sm/bold" as="span">
                  {t("transaction.applyDateFilter")}
                </Words>
              </Button>

              {(hasDateFilter || draftRange.from || draftRange.to) && (
                <button type="button" onClick={clearFilter} className="self-start">
                  <Words type="xs/bold" as="span" className="text-red-500 dark:text-red-400">
                    {t("transaction.clearDateFilter")}
                  </Words>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
