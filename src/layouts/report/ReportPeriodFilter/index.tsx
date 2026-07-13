import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCalendarDays, HiOutlineChevronLeft } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { Button } from "@/components/atoms/Button";
import { DateTimePickerFields } from "@/layouts/transaction/DateTimePickerModal";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";
import { parseIsoDateLocal, toIsoDateString } from "@/utils/report-period";
import type { ReportPeriodFilter as ReportPeriodFilterValue, ReportPeriodPreset } from "@/types/report.types";

const FIXED_PRESETS: ReportPeriodPreset[] = ["today", "week", "month", "year"];

type ActiveField = "from" | "to" | null;

function resolveDraftDate(value: string): Date {
  return value ? parseIsoDateLocal(value) : new Date();
}

function formatDisplayDate(value: string, locale: string): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parseIsoDateLocal(value));
  } catch {
    return value;
  }
}

interface ReportPeriodFilterProps {
  value: ReportPeriodFilterValue;
  onChange: (value: ReportPeriodFilterValue) => void;
}

export function ReportPeriodFilter({ value, onChange }: ReportPeriodFilterProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [draftRange, setDraftRange] = useState({ from: value.dateFrom, to: value.dateTo });
  const containerRef = useRef<HTMLDivElement>(null);

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

  function openCustomPopover() {
    setDraftRange(
      value.preset === "custom" ? { from: value.dateFrom, to: value.dateTo } : { from: "", to: "" },
    );
    setActiveField(null);
    setIsOpen((prev) => !prev);
  }

  function applyCustomRange() {
    if (!draftRange.from || !draftRange.to) return;
    onChange({ preset: "custom", dateFrom: draftRange.from, dateTo: draftRange.to });
    setIsOpen(false);
  }

  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <div className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto scrollbar-hide rounded-full bg-ink-100 p-1 dark:bg-ink-800">
        {FIXED_PRESETS.map((preset) => {
          const isActive = value.preset === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ preset, dateFrom: "", dateTo: "" })}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors",
                isActive
                  ? "bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-ink-50"
                  : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200",
              )}
            >
              <Words type={isActive ? "sm/bold" : "sm/regular"} as="span">
                {t(`reports.period.${preset}`)}
              </Words>
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={openCustomPopover}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-colors",
            value.preset === "custom"
              ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-400"
              : "border-ink-200 text-ink-500 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800",
          )}
        >
          <HiOutlineCalendarDays className="h-4 w-4 shrink-0" />
          <Words type={value.preset === "custom" ? "sm/bold" : "sm/regular"} as="span" className="whitespace-nowrap">
            {value.preset === "custom"
              ? `${formatDisplayDate(value.dateFrom, language)} - ${formatDisplayDate(value.dateTo, language)}`
              : t("reports.period.custom")}
          </Words>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink-200 bg-white p-4 shadow-lg sm:left-auto sm:right-0 dark:border-ink-800 dark:bg-ink-900">
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
                  value={resolveDraftDate(activeField === "from" ? draftRange.from : draftRange.to)}
                  title={activeField === "from" ? t("transaction.dateFrom") : t("transaction.dateTo")}
                  onClose={() => setActiveField(null)}
                  onConfirm={(date) => {
                    setDraftRange((prev) => ({ ...prev, [activeField]: toIsoDateString(date) }));
                    setActiveField(null);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Words type="xs/bold" className="uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  {t("reports.period.custom")}
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
                  onClick={applyCustomRange}
                  disabled={!draftRange.from || !draftRange.to}
                  className="w-full"
                >
                  <Words type="sm/bold" as="span">
                    {t("transaction.applyDateFilter")}
                  </Words>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
