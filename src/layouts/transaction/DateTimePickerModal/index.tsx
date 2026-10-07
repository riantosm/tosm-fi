import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuCheck, LuChevronLeft, LuChevronRight, LuClock } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { Chip } from "@/components/molecules/Chip";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";

interface DateTimePickerModalProps {
  isOpen: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
/** A Monday, so weekday labels start on Monday (design: Sen … Min). */
const WEEKDAY_REFERENCE_MONDAY = new Date(2023, 0, 2);

function getWeekdayLabels(locale: string): string[] {
  try {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(WEEKDAY_REFERENCE_MONDAY);
      date.setDate(WEEKDAY_REFERENCE_MONDAY.getDate() + index);
      return formatter.format(date).replace(".", "");
    });
  } catch {
    return ["M", "T", "W", "T", "F", "S", "S"];
  }
}

function formatMonthYear(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
  } catch {
    return date.toDateString();
  }
}

function to12Hour(hour24: number): { hour12: number; meridiem: "AM" | "PM" } {
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, meridiem };
}

function to24Hour(hour12: number, meridiem: "AM" | "PM"): number {
  const normalized = hour12 % 12;
  return meridiem === "PM" ? normalized + 12 : normalized;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Six-week Monday-first grid for the month of `viewDate`, including leading/trailing days. */
function buildMonthGrid(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
  return Array.from({ length: cells }, (_, index) => new Date(year, month, index - offset + 1));
}

export function DateTimePickerModal({
  isOpen,
  value,
  onClose,
  onConfirm,
}: DateTimePickerModalProps) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={t("transaction.dateTimeLabel")}>
      {isOpen && (
        <DateTimePickerFields
          value={value}
          onClose={onClose}
          onConfirm={onConfirm}
          showHeader={false}
        />
      )}
    </Modal>
  );
}

interface DateTimePickerFieldsProps extends Omit<DateTimePickerModalProps, "isOpen"> {
  dateOnly?: boolean;
  title?: string;
  /** Renders its own title + close row (when embedded in a popover/dialog without a Modal title). */
  showHeader?: boolean;
}

export function DateTimePickerFields({
  value,
  onClose,
  onConfirm,
  dateOnly = false,
  title,
  showHeader = true,
}: DateTimePickerFieldsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);

  const [viewDate, setViewDate] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const [direction, setDirection] = useState(0);
  const [selectedDate, setSelectedDate] = useState(value);
  const [hour12, setHour12] = useState(() => to12Hour(value.getHours()).hour12);
  const [minute, setMinute] = useState(value.getMinutes());
  const [meridiem, setMeridiem] = useState<"AM" | "PM">(() => to12Hour(value.getHours()).meridiem);

  const weekdayLabels = getWeekdayLabels(locale);
  const grid = buildMonthGrid(viewDate);
  const today = new Date();

  function goToMonth(offset: number) {
    setDirection(offset);
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function selectDay(day: Date) {
    setSelectedDate(day);
    if (day.getMonth() !== viewDate.getMonth()) {
      setDirection(day < viewDate ? -1 : 1);
      setViewDate(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  }

  function goToToday() {
    const now = new Date();
    setDirection(0);
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }

  function goToNow() {
    goToToday();
    const { hour12: nextHour, meridiem: nextMeridiem } = to12Hour(new Date().getHours());
    setHour12(nextHour);
    setMinute(new Date().getMinutes());
    setMeridiem(nextMeridiem);
  }

  function handleConfirm() {
    const result = new Date(selectedDate);
    if (dateOnly) {
      onConfirm(result);
      onClose();
      return;
    }
    const clampedHour = Math.min(12, Math.max(1, hour12 || 12));
    const clampedMinute = Math.min(59, Math.max(0, minute || 0));
    result.setHours(to24Hour(clampedHour, meridiem), clampedMinute, 0, 0);
    onConfirm(result);
    onClose();
  }

  const timeBoxClass =
    "h-11 w-12 rounded-control bg-surface text-center font-num text-[18px] font-semibold text-text tabular outline-none transition-shadow focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_25%,transparent)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div className="flex flex-col gap-4">
      {showHeader && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="truncate font-display text-[19px] font-semibold text-text">
            {title ?? t("transaction.dateTimeLabel")}
          </h2>
          <ModalCloseButton onClose={onClose} />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <IconButton
          label={t("common.previous")}
          icon={<LuChevronLeft />}
          size="sm"
          tooltip={false}
          onClick={() => goToMonth(-1)}
        />
        <span className="font-display text-[16px] font-semibold text-text first-letter:uppercase">
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
              {label}
            </span>
          ))}
        </div>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <m.div
            key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="grid grid-cols-7 gap-y-1"
          >
            {grid.map((day) => {
              const isOutside = day.getMonth() !== viewDate.getMonth();
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDay(day)}
                  aria-pressed={isSelected}
                  className="group flex h-10 items-center justify-center"
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full text-[14px] tabular transition-[background-color,color,transform] duration-200",
                      isSelected
                        ? "scale-100 bg-primary font-semibold text-primary-fg shadow-[0_4px_12px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                        : cn(
                            "group-hover:bg-surface-2",
                            isOutside ? "text-text-3/60" : "font-medium text-text",
                            isToday &&
                              "font-semibold text-primary-text ring-1 ring-primary/40 ring-inset",
                          ),
                    )}
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </m.div>
        </AnimatePresence>
      </div>

      {!dateOnly && (
        <div className="flex items-center gap-2 rounded-[16px] bg-surface-2 py-2.5 pr-2.5 pl-4">
          <LuClock className="size-4 shrink-0 text-text-3" />
          <span className="flex-1 text-[13.5px] font-medium text-text-2">
            {t("transaction.timeLabel")}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            value={String(hour12).padStart(2, "0")}
            aria-label={t("transaction.hourLabel")}
            onChange={(event) => setHour12(Number(event.target.value))}
            onFocus={(event) => event.target.select()}
            className={timeBoxClass}
          />
          <span className="font-num text-[18px] font-semibold text-text-3">:</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            value={String(minute).padStart(2, "0")}
            aria-label={t("transaction.minuteLabel")}
            onChange={(event) => setMinute(Number(event.target.value))}
            onFocus={(event) => event.target.select()}
            className={timeBoxClass}
          />
          <SegmentedControl
            options={[
              { value: "AM", label: "AM" },
              { value: "PM", label: "PM" },
            ]}
            value={meridiem}
            onChange={setMeridiem}
            className="ml-1 bg-surface"
            activeClassName="text-primary-text"
            thumbClassName="bg-primary-soft shadow-none"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Chip size="sm" onClick={goToToday}>
          {t("transaction.today")}
        </Chip>
        {!dateOnly && (
          <Chip size="sm" onClick={goToNow}>
            {t("transaction.now")}
          </Chip>
        )}
      </div>

      <ModalActions className="pt-1">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button type="button" leftIcon={<LuCheck />} onClick={handleConfirm}>
          {t("common.select")}
        </Button>
      </ModalActions>
    </div>
  );
}
