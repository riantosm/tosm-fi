import { toIntlLocale } from "@/utils/locale";
import type {
  NetWorthTimelineGranularity,
  TimelinePoint,
} from "@/types/investment-transaction.types";

/** Presentational helpers shared by the investment layouts (no data/behavior). */

/** "8,4%" in the UI language (absolute value — callers add the ▲/▼ or sign). */
export function formatPercent(value: number, language: string): string {
  const formatted = new Intl.NumberFormat(toIntlLocale(language), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return `${formatted}%`;
}

/**
 * Sums several running-total series (one per account) into one series.
 * Each input series is a step function (its value holds until its next point),
 * so the sum at any instant is the sum of every series' latest point so far.
 */
export function sumTimelines(series: TimelinePoint[][]): TimelinePoint[] {
  if (series.length === 0) return [];
  if (series.length === 1) return series[0];

  const events = series
    .flatMap((points, seriesIndex) =>
      points.map((point, order) => ({
        point,
        seriesIndex,
        order,
        time: new Date(point.date).getTime(),
      })),
    )
    .sort((a, b) => a.time - b.time || a.seriesIndex - b.seriesIndex || a.order - b.order);

  const invested = new Array<number>(series.length).fill(0);
  const current = new Array<number>(series.length).fill(0);
  const result: TimelinePoint[] = [];

  for (const event of events) {
    invested[event.seriesIndex] = event.point.invested;
    current[event.seriesIndex] = event.point.current;
    const next: TimelinePoint = {
      date: event.point.date,
      invested: invested.reduce((sum, value) => sum + value, 0),
      current: current.reduce((sum, value) => sum + value, 0),
    };
    const last = result[result.length - 1];
    if (last && last.date === next.date) result[result.length - 1] = next;
    else result.push(next);
  }

  return result;
}

function bucketKey(date: Date, granularity: NetWorthTimelineGranularity): string {
  if (granularity === "year") return `${date.getFullYear()}`;
  if (granularity === "month") return `${date.getFullYear()}-${date.getMonth()}`;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Keeps the last running total of each day / month / year (end-of-period value). */
export function bucketTimeline(
  points: TimelinePoint[],
  granularity: NetWorthTimelineGranularity,
): TimelinePoint[] {
  const buckets = new Map<string, TimelinePoint>();
  for (const point of points) {
    buckets.set(bucketKey(new Date(point.date), granularity), point);
  }
  return Array.from(buckets.values());
}

/** X-axis / tooltip label for a timeline date at the given granularity. */
export function formatTimelineDate(
  iso: string,
  granularity: NetWorthTimelineGranularity,
  language: string,
  variant: "axis" | "tooltip" = "axis",
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions =
    granularity === "year"
      ? { year: "numeric" }
      : granularity === "month"
        ? variant === "axis"
          ? { month: "short" }
          : { month: "short", year: "numeric" }
        : variant === "axis"
          ? { day: "numeric", month: "short" }
          : { day: "numeric", month: "short", year: "numeric" };
  return new Intl.DateTimeFormat(toIntlLocale(language), options).format(date);
}

/** "Hari ini" / "Kemarin" / "28 Sep" — with `withDate`, today/yesterday also get the date ("Hari ini · 5 Okt"). */
export function formatRelativeDay(
  date: Date,
  language: string,
  labels: { today: string; yesterday: string },
  withDate = false,
): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const absolute = new Intl.DateTimeFormat(toIntlLocale(language), {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
  }).format(date);
  const relative =
    date.toDateString() === new Date().toDateString()
      ? labels.today
      : date.toDateString() === yesterday.toDateString()
        ? labels.yesterday
        : null;
  if (!relative) return absolute;
  return withDate ? `${relative} · ${absolute}` : relative;
}
