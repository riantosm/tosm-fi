import { startOfMonth } from "@/utils/month";
import type { ReportPeriodPreset } from "@/types/report.types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface ResolvedReportPeriod {
  dateFrom: string;
  dateTo: string;
  previousDateFrom: string;
  previousDateTo: string;
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

export function resolveReportPeriod(
  preset: ReportPeriodPreset,
  referenceDate: Date,
  custom?: { dateFrom: string; dateTo: string },
): ResolvedReportPeriod {
  let from: Date;
  let to: Date;
  // Presets with a well-defined calendar-previous period (month/year) compute it explicitly
  // below, since months and years vary in length — shifting back by the current period's day
  // count (the generic fallback further down) would misalign, e.g. a 30-day June "previous
  // period" would only reach back 30 days into 31-day May, silently dropping May 1st.
  let previousFrom: Date | undefined;
  let previousTo: Date | undefined;

  if (preset.startsWith("month:")) {
    const [year, month] = preset.slice("month:".length).split("-").map(Number);
    from = new Date(year, month - 1, 1);
    to = new Date(year, month, 0);
    previousFrom = new Date(year, month - 2, 1);
    previousTo = new Date(year, month - 1, 0);
  } else switch (preset) {
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
      previousFrom = new Date(referenceDate.getFullYear() - 1, 0, 1);
      previousTo = new Date(referenceDate.getFullYear() - 1, 11, 31);
      break;
    case "custom":
      from = custom ? parseIsoDateLocal(custom.dateFrom) : startOfMonth(referenceDate);
      to = custom ? parseIsoDateLocal(custom.dateTo) : referenceDate;
      break;
    case "month":
    default:
      from = startOfMonth(referenceDate);
      to = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
      previousFrom = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
      previousTo = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
      break;
  }

  if (to.getTime() < from.getTime()) [from, to] = [to, from];

  // Fallback for presets without a calendar-previous concept (today/week have a constant span
  // so this is already exact for them; custom is an arbitrary user-picked range where "shift by
  // the same span" is the only generally-defined notion of "previous period").
  if (!previousFrom || !previousTo) {
    const spanDays = daysBetweenInclusive(from, to);
    previousTo = addDays(from, -1);
    previousFrom = addDays(previousTo, -(spanDays - 1));
  }

  return {
    dateFrom: toIsoDateString(from),
    dateTo: toIsoDateString(to),
    previousDateFrom: toIsoDateString(previousFrom),
    previousDateTo: toIsoDateString(previousTo),
  };
}
