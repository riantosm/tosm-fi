import type { TFunction } from "i18next";
import type { Schedule, ScheduleFrequency } from "@/types/schedule.types";

/** Monday-first display order of weekday indices (0 = Sunday … 6 = Saturday). */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const MS_PER_DAY = 86400000;
// Average weeks/days per month — used only for the "rutin per bulan" estimate.
const WEEKS_PER_MONTH = 52 / 12;
const DAYS_PER_MONTH = 365 / 12;

export interface RecurrenceRule {
  frequency: ScheduleFrequency;
  weekdays: number[];
  /** Falls back to the start date's day when null (the backend derives it the same way). */
  dayOfMonth: number | null;
  /** 1-based; falls back to the start date's month when null. */
  month: number | null;
  startDate: Date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Clamps e.g. day 31 to the last day of a shorter month, like the backend does. */
function dateForMonth(year: number, month0: number, day: number): Date {
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  return new Date(year, month0, Math.min(day, daysInMonth));
}

/**
 * Schedule/occurrence dates are stored as UTC midnight ISO strings — read the
 * calendar date they represent as a local date, so timezones never shift it.
 */
export function parseScheduleDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return startOfDay(new Date(value));
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function ruleFromSchedule(schedule: Schedule): RecurrenceRule {
  return {
    frequency: schedule.frequency,
    weekdays: schedule.weekdays,
    dayOfMonth: schedule.dayOfMonth,
    month: schedule.month,
    startDate: parseScheduleDate(schedule.startDate),
  };
}

/**
 * First due date on/after `from` (today by default) and on/after the start
 * date — mirrors the backend's recurrence rules. Null when the rule can never
 * fire (weekly without any weekday).
 */
export function getNextDueDate(rule: RecurrenceRule, from: Date = new Date()): Date | null {
  const today = startOfDay(from);
  const start = startOfDay(rule.startDate);
  const base = start.getTime() > today.getTime() ? start : today;
  const day = rule.dayOfMonth ?? start.getDate();

  switch (rule.frequency) {
    case "daily":
      return base;
    case "weekly": {
      for (let offset = 0; offset < 7; offset++) {
        const candidate = addDays(base, offset);
        if (rule.weekdays.includes(candidate.getDay())) return candidate;
      }
      return null;
    }
    case "monthly": {
      const candidate = dateForMonth(base.getFullYear(), base.getMonth(), day);
      return candidate.getTime() >= base.getTime()
        ? candidate
        : dateForMonth(base.getFullYear(), base.getMonth() + 1, day);
    }
    case "yearly": {
      const month0 = (rule.month ?? start.getMonth() + 1) - 1;
      const candidate = dateForMonth(base.getFullYear(), month0, day);
      return candidate.getTime() >= base.getTime()
        ? candidate
        : dateForMonth(base.getFullYear() + 1, month0, day);
    }
    default:
      return null;
  }
}

/** Per-month cost of a schedule; yearly schedules are left out (null). */
export function monthlyEquivalent(schedule: Schedule): number | null {
  switch (schedule.frequency) {
    case "daily":
      return Math.round(schedule.amount * DAYS_PER_MONTH);
    case "weekly":
      return Math.round(schedule.amount * schedule.weekdays.length * WEEKS_PER_MONTH);
    case "monthly":
      return schedule.amount;
    default:
      return null;
  }
}

export function weekdayLabel(
  day: number,
  locale: string,
  style: "short" | "long" = "short",
): string {
  try {
    // 2023-01-01 was a Sunday, so day offsets map straight onto getDay() values.
    return new Intl.DateTimeFormat(locale, { weekday: style }).format(new Date(2023, 0, 1 + day));
  } catch {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] ?? String(day);
  }
}

function orderedWeekdays(weekdays: number[]): number[] {
  return WEEKDAY_ORDER.filter((day) => weekdays.includes(day));
}

/** "Sen, Rab, dan Jum" — a natural-language list of the selected weekdays. */
export function formatWeekdayList(weekdays: number[], locale: string): string {
  const labels = orderedWeekdays(weekdays).map((day) => weekdayLabel(day, locale));
  try {
    return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(labels);
  } catch {
    return labels.join(", ");
  }
}

function formatDayMonth(day: number, month: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(
      new Date(2024, month - 1, day),
    );
  } catch {
    return `${day}/${month}`;
  }
}

/** "Bulanan · tgl 5", "Mingguan · Sen, Rab, Jum", "Tahunan · 5 Maret". */
export function describeFrequency(rule: RecurrenceRule, t: TFunction, locale: string): string {
  const day = rule.dayOfMonth ?? rule.startDate.getDate();
  switch (rule.frequency) {
    case "daily":
      return t("schedule.frequencyDaily");
    case "weekly": {
      const days = orderedWeekdays(rule.weekdays)
        .map((weekday) => weekdayLabel(weekday, locale))
        .join(", ");
      return days ? `${t("schedule.frequencyWeekly")} · ${days}` : t("schedule.frequencyWeekly");
    }
    case "monthly":
      return `${t("schedule.frequencyMonthly")} · ${t("schedule.dayOfMonthShort", { day })}`;
    case "yearly": {
      const month = rule.month ?? rule.startDate.getMonth() + 1;
      return `${t("schedule.frequencyYearly")} · ${formatDayMonth(day, month, locale)}`;
    }
    default:
      return rule.frequency;
  }
}

/** One-line hint under the schedule form describing when bills will appear. */
export function describeRecurrencePreview(
  rule: RecurrenceRule,
  t: TFunction,
  locale: string,
): string {
  const day = rule.dayOfMonth ?? rule.startDate.getDate();
  switch (rule.frequency) {
    case "daily":
      return t("schedule.previewDaily");
    case "weekly":
      return rule.weekdays.length > 0
        ? t("schedule.previewWeekly", { days: formatWeekdayList(rule.weekdays, locale) })
        : t("schedule.weekdaysRequiredError");
    case "monthly":
      return t("schedule.previewMonthly", { day });
    case "yearly":
      return t("schedule.previewYearly", {
        date: formatDayMonth(day, rule.month ?? rule.startDate.getMonth() + 1, locale),
      });
    default:
      return "";
  }
}

function dayDiff(date: Date, from: Date): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

/**
 * Short due-date label: "Hari ini" / "Besok" / "Sel, 20 Okt" (this year) /
 * "5 Mar 2027" (other years).
 */
export function formatDueDate(
  date: Date,
  locale: string,
  labels: { today: string; tomorrow: string },
  from: Date = new Date(),
): string {
  const diff = dayDiff(date, from);
  if (diff === 0) return labels.today;
  if (diff === 1) return labels.tomorrow;
  try {
    const sameYear = date.getFullYear() === from.getFullYear();
    return new Intl.DateTimeFormat(
      locale,
      sameYear
        ? { weekday: "short", day: "numeric", month: "short" }
        : { day: "numeric", month: "short", year: "numeric" },
    ).format(date);
  } catch {
    return date.toDateString();
  }
}

/** "Senin, 5 Okt 2026" — or without the year via `withYear: false`. */
export function formatLongDate(date: Date, locale: string, withYear = true): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export function isToday(date: Date, from: Date = new Date()): boolean {
  return dayDiff(date, from) === 0;
}
