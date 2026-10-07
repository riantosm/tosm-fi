import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuCalendarRange, LuCheck, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { ModalActions } from "@/components/molecules/Modal";
import { Popover } from "@/components/molecules/Popover";
import { useLanguage } from "@/hooks/use-language";
import {
  buildMonthWeeks,
  formatMonthYear,
  formatShortDate,
  getWeekdayLabels,
  parseIsoDate,
  toIsoDate,
} from "@/utils/calendar";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";

export interface DateRangeFilter {
  from: string;
  to: string;
}

type ActiveField = "from" | "to";

const EASE = [0.22, 1, 0.36, 1] as const;

interface DateRangeFilterPopoverProps {
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  /** pill = labelled desktop button; icon = round phone app-bar button. */
  variant?: "pill" | "icon";
  align?: "start" | "end";
}

/** "Rentang tanggal" — trigger + Dari/Sampai range calendar (popover on desktop, sheet on phones). */
export function DateRangeFilterPopover({
  dateRange,
  onDateRangeChange,
  variant = "pill",
  align = "start",
}: DateRangeFilterPopoverProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const [isOpen, setIsOpen] = useState(false);
  const hasDateFilter = Boolean(dateRange.from || dateRange.to);

  const label = hasDateFilter
    ? dateRange.from === dateRange.to || !dateRange.to
      ? formatShortDate(parseIsoDate(dateRange.from || dateRange.to), locale)
      : `${formatShortDate(parseIsoDate(dateRange.from), locale)} – ${formatShortDate(parseIsoDate(dateRange.to), locale)}`
    : t("transaction.dateFilterTitle");

  const trigger =
    variant === "icon" ? (
      <span className="relative inline-flex">
        <IconButton
          label={t("transaction.dateFilterTitle")}
          icon={<LuCalendarRange />}
          variant={hasDateFilter ? "soft" : "surface"}
          size="lg"
          tooltip={false}
          className={cn(hasDateFilter && "bg-primary-soft text-primary-text")}
          onClick={() => setIsOpen((prev) => !prev)}
        />
        {hasDateFilter && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-bg" />
        )}
      </span>
    ) : (
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={cn(
          "pressable flex h-[38px] max-w-[260px] items-center gap-2 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors",
          hasDateFilter
            ? "border-primary bg-primary-soft text-primary-text"
            : "border-border bg-surface text-text-2 hover:bg-surface-2 hover:text-text",
        )}
      >
        <LuCalendarRange className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    );

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={trigger}
      align={align}
      panelClassName="w-[400px] p-5"
    >
      {isOpen && (
        <DateRangeFields
          value={dateRange}
          onClose={() => setIsOpen(false)}
          onApply={(range) => {
            onDateRangeChange(range);
            setIsOpen(false);
          }}
        />
      )}
    </Popover>
  );
}

interface DateRangeFieldsProps {
  value: DateRangeFilter;
  onClose: () => void;
  onApply: (range: DateRangeFilter) => void;
  /** Left button — defaults to clearing the range (onApply with empty dates). */
  onClear?: () => void;
}

/** Dari/Sampai fields + range calendar — the body of every "Rentang tanggal" picker. */
export function DateRangeFields({ value, onClose, onApply, onClear }: DateRangeFieldsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);

  const [draft, setDraft] = useState<DateRangeFilter>(value);
  const [activeField, setActiveField] = useState<ActiveField>(value.from ? "to" : "from");
  const [viewDate, setViewDate] = useState(() => {
    const anchor = value.from ? parseIsoDate(value.from) : new Date();
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });
  const [direction, setDirection] = useState(0);

  const weeks = buildMonthWeeks(viewDate.getFullYear(), viewDate.getMonth());
  const weekdayLabels = getWeekdayLabels(locale);
  const todayIso = toIsoDate(new Date());

  function goToMonth(offset: number) {
    setDirection(offset);
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function pickDay(iso: string) {
    if (activeField === "from" || !draft.from) {
      setDraft({ from: iso, to: draft.to && draft.to >= iso ? draft.to : "" });
      setActiveField("to");
      return;
    }
    if (iso < draft.from) {
      setDraft({ from: iso, to: draft.from });
    } else {
      setDraft({ ...draft, to: iso });
    }
  }

  function fieldBox(field: ActiveField) {
    const iso = draft[field];
    const isActive = activeField === field;
    return (
      <button
        type="button"
        onClick={() => setActiveField(field)}
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-0.5 rounded-control border px-3.5 py-2.5 text-left transition-colors duration-200",
          isActive
            ? "border-primary bg-primary-soft"
            : "border-transparent bg-surface-2 hover:bg-surface-3",
        )}
      >
        <span className={cn("text-[12px]", isActive ? "text-primary-text" : "text-text-3")}>
          {field === "from" ? t("transaction.dateFrom") : t("transaction.dateTo")}
        </span>
        <span className="truncate text-[14px] font-semibold text-text tabular">
          {iso ? formatShortDate(parseIsoDate(iso), locale) : "—"}
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[19px] font-semibold text-text">
          {t("transaction.dateFilterTitle")}
        </h2>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="flex gap-2.5">
        {fieldBox("from")}
        {fieldBox("to")}
      </div>

      <div className="flex items-center justify-between">
        <IconButton
          label={t("common.previous")}
          icon={<LuChevronLeft />}
          size="sm"
          tooltip={false}
          onClick={() => goToMonth(-1)}
        />
        <span className="font-display text-[15.5px] font-semibold text-text first-letter:uppercase">
          {formatMonthYear(viewDate, locale)}
        </span>
        <IconButton
          label={t("common.next")}
          icon={<LuChevronRight />}
          size="sm"
          tooltip={false}
          onClick={() => goToMonth(1)}
        />
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-7 pb-1">
          {weekdayLabels.map((label, index) => (
            <span key={index} className="py-1 text-center text-[12px] font-medium text-text-3">
              {label.replace(".", "")}
            </span>
          ))}
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <m.div
            key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex flex-col gap-1"
          >
            {weeks.map((week) => (
              <div key={week[0].iso} className="grid grid-cols-7">
                {week.map((day) => {
                  const isStart = day.iso === draft.from;
                  const isEnd = day.iso === (draft.to || draft.from);
                  const inRange = Boolean(
                    draft.from && draft.to && day.iso > draft.from && day.iso < draft.to,
                  );
                  const isEndpoint = isStart || isEnd;
                  const hasBand = Boolean(
                    draft.from && draft.to && draft.from !== draft.to && (inRange || isEndpoint),
                  );
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => pickDay(day.iso)}
                      aria-pressed={isEndpoint}
                      className={cn(
                        "group relative flex h-10 items-center justify-center",
                        hasBand && "bg-primary-soft",
                        hasBand && isStart && "rounded-l-full",
                        hasBand && isEnd && "rounded-r-full",
                      )}
                    >
                      <span
                        className={cn(
                          "relative flex size-10 items-center justify-center rounded-full text-[14px] tabular transition-colors duration-200",
                          isEndpoint
                            ? "bg-primary font-semibold text-primary-fg shadow-[0_4px_12px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                            : inRange
                              ? "font-semibold text-primary-text"
                              : cn(
                                  "group-hover:bg-surface-2",
                                  day.inMonth ? "font-medium text-text" : "text-text-3/60",
                                  day.iso === todayIso && "font-semibold text-primary-text",
                                ),
                        )}
                      >
                        {day.date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </m.div>
        </AnimatePresence>
      </div>

      <ModalActions>
        <Button
          type="button"
          variant="outline"
          onClick={() => (onClear ? onClear() : onApply({ from: "", to: "" }))}
        >
          {t("transaction.clearDateFilterShort")}
        </Button>
        <Button
          type="button"
          leftIcon={<LuCheck />}
          disabled={!draft.from}
          onClick={() => onApply({ from: draft.from, to: draft.to || draft.from })}
        >
          {t("transaction.applyDateFilter")}
        </Button>
      </ModalActions>
    </div>
  );
}
