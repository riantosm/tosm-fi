import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCalendarRange } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { Popover } from "@/components/molecules/Popover";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { DateRangeFields } from "@/layouts/transaction/DateRangeFilterPopover";
import { useFirstTransactionMonth } from "@/hooks/use-first-transaction-month";
import { useLanguage } from "@/hooks/use-language";
import { formatShortDate, parseIsoDate } from "@/utils/calendar";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";
import { addMonths, formatMonthParam, startOfMonth } from "@/utils/month";
import type {
  ReportPeriodFilter as ReportPeriodFilterValue,
  ReportPeriodPreset,
} from "@/types/report.types";

const FIXED_PRESETS: ReportPeriodPreset[] = ["today", "week", "month", "year"];
const DEFAULT_PRESET: ReportPeriodPreset = "month";

/** "YYYY-MM" presets for every month from the user's first transaction up to (excluding) the current month. */
function generatePastMonthPresets(firstMonth: string, referenceDate: Date): string[] {
  const [year, month] = firstMonth.split("-").map(Number);
  const currentStart = startOfMonth(referenceDate);

  const months: string[] = [];
  let cursor = new Date(year, month - 1, 1);
  while (cursor.getTime() < currentStart.getTime()) {
    months.push(formatMonthParam(cursor));
    cursor = addMonths(cursor, 1);
  }
  return months;
}

function formatMonthLabel(month: string, locale: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(
    new Date(year, monthNum - 1, 1),
  );
}

interface ReportPeriodFilterProps {
  value: ReportPeriodFilterValue;
  onChange: (value: ReportPeriodFilterValue) => void;
}

/**
 * Period strip: past months (from the first transaction) + Hari/Minggu/Bulan/Tahun ini,
 * plus "Custom Range". Phones keep only the four presets and a calendar button.
 */
export function ReportPeriodFilter({ value, onChange }: ReportPeriodFilterProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const stripRef = useRef<HTMLDivElement>(null);

  const firstTransactionMonth = useFirstTransactionMonth();
  const pastMonthPresets = useMemo(
    () =>
      firstTransactionMonth ? generatePastMonthPresets(firstTransactionMonth, new Date()) : [],
    [firstTransactionMonth],
  );

  // Newest months sit next to "Hari ini" — start scrolled to the end.
  useEffect(() => {
    const strip = stripRef.current?.querySelector<HTMLElement>("[role=tablist]");
    strip?.scrollTo({ left: strip.scrollWidth });
  }, [pastMonthPresets.length]);

  const isCustom = value.preset === "custom";
  const desktopOptions = [
    ...pastMonthPresets.map((month) => ({
      value: `month:${month}` as ReportPeriodPreset,
      label: formatMonthLabel(month, locale),
    })),
    ...FIXED_PRESETS.map((preset) => ({ value: preset, label: t(`reports.period.${preset}`) })),
  ];
  const phoneOptions = FIXED_PRESETS.map((preset) => ({
    value: preset,
    label: t(`reports.periodShort.${preset}`),
  }));

  function selectPreset(preset: ReportPeriodPreset) {
    onChange({ preset, dateFrom: "", dateTo: "" });
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div ref={stripRef} className="hidden min-w-0 flex-1 lg:block">
        <SegmentedControl
          options={desktopOptions}
          value={value.preset}
          onChange={selectPreset}
          variant="solid"
          size="md"
          fill
          className="[&>button]:min-w-[88px]"
          ariaLabel={t("reports.periodLabel")}
        />
      </div>
      <div className="min-w-0 flex-1 lg:hidden">
        <SegmentedControl
          options={phoneOptions}
          value={value.preset}
          onChange={selectPreset}
          variant="solid"
          size="sm"
          fill
          ariaLabel={t("reports.periodLabel")}
        />
      </div>
      <CustomRangeButton
        value={value}
        isActive={isCustom}
        label={
          isCustom
            ? `${formatShortDate(parseIsoDate(value.dateFrom), locale)} – ${formatShortDate(parseIsoDate(value.dateTo), locale)}`
            : t("reports.period.custom")
        }
        onApply={(from, to) => onChange({ preset: "custom", dateFrom: from, dateTo: to })}
        onClear={() => selectPreset(DEFAULT_PRESET)}
      />
    </div>
  );
}

interface CustomRangeButtonProps {
  value: ReportPeriodFilterValue;
  isActive: boolean;
  label: string;
  onApply: (from: string, to: string) => void;
  onClear: () => void;
}

function CustomRangeButton({ value, isActive, label, onApply, onClear }: CustomRangeButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const trigger = (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={cn(
          "pressable hidden h-[46px] max-w-[260px] shrink-0 items-center gap-2 rounded-full border px-4 text-[13.5px] font-medium shadow-card transition-colors lg:flex",
          isActive
            ? "border-primary bg-primary-soft text-primary-text"
            : "border-transparent bg-surface text-text-2 hover:text-text",
        )}
      >
        <LuCalendarRange className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
      <IconButton
        label={t("reports.period.custom")}
        icon={<LuCalendarRange />}
        variant="surface"
        size="md"
        tooltip={false}
        className={cn("lg:hidden", isActive && "bg-primary-soft text-primary-text")}
        onClick={() => setIsOpen((prev) => !prev)}
      />
    </>
  );

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={trigger}
      align="end"
      panelClassName="w-[400px] p-5"
    >
      {isOpen && (
        <DateRangeFields
          value={isActive ? { from: value.dateFrom, to: value.dateTo } : { from: "", to: "" }}
          onClose={() => setIsOpen(false)}
          onApply={(range) => {
            if (range.from) onApply(range.from, range.to || range.from);
            setIsOpen(false);
          }}
          onClear={() => {
            onClear();
            setIsOpen(false);
          }}
        />
      )}
    </Popover>
  );
}
