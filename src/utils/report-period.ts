import { startOfMonth } from "@/utils/month";
import type { ReportPeriodPreset } from "@/types/report.types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const HOUR_BLOCK_STARTS = [0, 4, 8, 12, 16, 20];

export interface ResolvedReportPeriod {
  dateFrom: string;
  dateTo: string;
  previousDateFrom: string;
  previousDateTo: string;
}

export interface ReportBucket {
  label: string;
  start: Date;
  end: Date;
}

export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(date), diffToMonday);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}

function daysBetweenInclusive(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY) + 1;
}

function clampDate(date: Date, max: Date): Date {
  return date.getTime() > max.getTime() ? max : date;
}

export function resolveReportPeriod(
  preset: ReportPeriodPreset,
  referenceDate: Date,
  custom?: { dateFrom: string; dateTo: string },
): ResolvedReportPeriod {
  let from: Date;
  let to: Date;

  switch (preset) {
    case "today":
      from = startOfDay(referenceDate);
      to = from;
      break;
    case "week":
      from = startOfWeek(referenceDate);
      to = addDays(from, 6);
      break;
    case "year":
      from = startOfYear(referenceDate);
      to = endOfYear(referenceDate);
      break;
    case "custom":
      from = custom ? parseIsoDateLocal(custom.dateFrom) : startOfMonth(referenceDate);
      to = custom ? parseIsoDateLocal(custom.dateTo) : referenceDate;
      break;
    case "month":
    default:
      from = startOfMonth(referenceDate);
      to = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
      break;
  }

  if (to.getTime() < from.getTime()) [from, to] = [to, from];

  const spanDays = daysBetweenInclusive(from, to);
  const previousTo = addDays(from, -1);
  const previousFrom = addDays(previousTo, -(spanDays - 1));

  return {
    dateFrom: toIsoDateString(from),
    dateTo: toIsoDateString(to),
    previousDateFrom: toIsoDateString(previousFrom),
    previousDateTo: toIsoDateString(previousTo),
  };
}

/**
 * Chooses bucket granularity (hourly/daily/weekly/monthly) from the period span
 * so the cash flow chart stays readable whether the range is "today" or "this year".
 */
export function buildReportBuckets(dateFrom: string, dateTo: string, locale: string): ReportBucket[] {
  const from = parseIsoDateLocal(dateFrom);
  const to = parseIsoDateLocal(dateTo);
  const spanDays = daysBetweenInclusive(from, to);

  if (spanDays <= 1) {
    return HOUR_BLOCK_STARTS.map((hour) => ({
      label: `${String(hour).padStart(2, "0")}:00`,
      start: new Date(from.getFullYear(), from.getMonth(), from.getDate(), hour, 0, 0, 0),
      end: new Date(from.getFullYear(), from.getMonth(), from.getDate(), hour + 3, 59, 59, 999),
    }));
  }

  if (spanDays <= 14) {
    return Array.from({ length: spanDays }, (_, index) => {
      const day = addDays(from, index);
      return {
        label: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day),
        start: startOfDay(day),
        end: endOfDay(day),
      };
    });
  }

  if (spanDays <= 62) {
    const buckets: ReportBucket[] = [];
    let cursor = from;
    let weekIndex = 1;
    while (cursor.getTime() <= to.getTime()) {
      const weekEnd = clampDate(addDays(cursor, 6), to);
      buckets.push({
        label: `W${weekIndex}`,
        start: startOfDay(cursor),
        end: endOfDay(weekEnd),
      });
      cursor = addDays(weekEnd, 1);
      weekIndex += 1;
    }
    return buckets;
  }

  const buckets: ReportBucket[] = [];
  let cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const lastMonth = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cursor.getTime() <= lastMonth.getTime()) {
    buckets.push({
      label: new Intl.DateTimeFormat(locale, { month: "short" }).format(cursor),
      start: new Date(cursor.getFullYear(), cursor.getMonth(), 1, 0, 0, 0, 0),
      end: new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999),
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return buckets;
}
