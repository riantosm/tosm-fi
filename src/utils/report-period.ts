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

  if (preset.startsWith("month:")) {
    const [year, month] = preset.slice("month:".length).split("-").map(Number);
    from = new Date(year, month - 1, 1);
    to = new Date(year, month, 0);
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
