import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";

interface DateTimePickerModalProps {
  isOpen: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

const WEEKDAY_REFERENCE_SUNDAY = new Date(2023, 0, 1);

function getWeekdayLabels(locale: string): string[] {
  try {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(WEEKDAY_REFERENCE_SUNDAY);
      date.setDate(WEEKDAY_REFERENCE_SUNDAY.getDate() + index);
      return formatter.format(date);
    });
  } catch {
    return ["S", "M", "T", "W", "T", "F", "S"];
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

export function DateTimePickerModal({
  isOpen,
  value,
  onClose,
  onConfirm,
}: DateTimePickerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {isOpen && <DateTimePickerFields value={value} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

interface DateTimePickerFieldsProps extends Omit<DateTimePickerModalProps, "isOpen"> {
  dateOnly?: boolean;
  title?: string;
}

export function DateTimePickerFields({
  value,
  onClose,
  onConfirm,
  dateOnly = false,
  title,
}: DateTimePickerFieldsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [viewDate, setViewDate] = useState(value);
  const [selectedDate, setSelectedDate] = useState(value);
  const [hour12, setHour12] = useState(() => to12Hour(value.getHours()).hour12);
  const [minute, setMinute] = useState(value.getMinutes());
  const [meridiem, setMeridiem] = useState<"AM" | "PM">(() => to12Hour(value.getHours()).meridiem);

  const weekdayLabels = getWeekdayLabels(language);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function goToMonth(offset: number) {
    setViewDate(new Date(year, month + offset, 1));
  }

  function goToToday() {
    const now = new Date();
    setViewDate(now);
    setSelectedDate(now);
  }

  function isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {title ?? t("transaction.selectDateTimeTitle")}
        </Words>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-full bg-ink-100 px-3 py-1 text-ink-600 transition-colors hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
          >
            <Words type="xs/bold" as="span">
              {t("transaction.today")}
            </Words>
          </button>
          <ModalCloseButton onClose={onClose} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          <HiOutlineChevronLeft className="h-4 w-4" />
        </button>
        <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
          {formatMonthYear(viewDate, language)}
        </Words>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          <HiOutlineChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdayLabels.map((label, index) => (
          <Words
            key={index}
            type="xs/bold"
            className="py-1 text-center text-ink-400 dark:text-ink-500"
          >
            {label}
          </Words>
        ))}

        {Array.from({ length: firstWeekday }, (_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayDate = new Date(year, month, day);
          const isSelected = isSameDay(dayDate, selectedDate);

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDate(dayDate)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                isSelected
                  ? "bg-primary-500 text-white dark:bg-primary-500 dark:text-ink-950"
                  : "text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800",
              )}
            >
              <Words type="sm/regular" as="span">
                {day}
              </Words>
            </button>
          );
        })}
      </div>

      {!dateOnly && (
        <div className="flex items-center justify-center gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
          <Input
            type="number"
            min={1}
            max={12}
            value={hour12}
            onChange={(event) => setHour12(Number(event.target.value))}
            className="w-14 text-center"
          />
          <Words type="lg/bold" className="text-ink-400 dark:text-ink-500">
            :
          </Words>
          <Input
            type="number"
            min={0}
            max={59}
            value={minute}
            onChange={(event) => setMinute(Number(event.target.value))}
            className="w-14 text-center"
          />

          <div className="flex overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
            {(["AM", "PM"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMeridiem(option)}
                className={cn(
                  "px-3 py-2.5 transition-colors",
                  meridiem === option
                    ? "bg-primary-500 text-white dark:bg-primary-500 dark:text-ink-950"
                    : "text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800",
                )}
              >
                <Words type="xs/bold" as="span">
                  {option}
                </Words>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          <Words type="sm/bold" as="span">
            {t("common.cancel")}
          </Words>
        </Button>
        <Button type="button" className="flex-1" onClick={handleConfirm}>
          <Words type="sm/bold" as="span">
            {t("common.confirm")}
          </Words>
        </Button>
      </div>
    </div>
  );
}
