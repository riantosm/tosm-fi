import { Words } from "@/components/atoms/Words";
import { cn } from "@/utils/cn";

interface BudgetProgressBarProps {
  /** Day-of-month "today" sits on, 1-based. */
  dayOfMonth: number;
  daysInMonth: number;
  /** spent/limit * 100 — may exceed 100, this is a reminder only, never clamped to a hard cap. */
  percentage: number;
  todayLabel: string;
  startLabel: string;
  endLabel: string;
  className?: string;
}

// Purpose-built for a saturated colored card background (BudgetCard /
// BudgetDetailView headers) — not a generic progress bar, hence the
// white-tinted track/labels rather than the usual ink-100/800 pairing.
export function BudgetProgressBar({
  dayOfMonth,
  daysInMonth,
  percentage,
  todayLabel,
  startLabel,
  endLabel,
  className,
}: BudgetProgressBarProps) {
  // "Today" (pill + stem) tracks the calendar — how far into the month we are.
  const elapsedRatio = daysInMonth > 0 ? dayOfMonth / daysInMonth : 0;
  // The fill itself tracks spending — how much of the limit is used, capped
  // at 100% of the bar's width even when over limit (the "%" badge below,
  // and its red color past 100, is what actually communicates the overage).
  const spentRatio = Math.min(1, Math.max(0, percentage / 100));
  const roundedPercentage = Math.max(0, Math.round(percentage));
  const isOverLimit = roundedPercentage > 100;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative h-11 w-full">
        <div
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 shadow-sm"
          style={{ left: `${elapsedRatio * 100}%` }}
        >
          <Words type="xxs/bold" as="span" className="flex text-ink-700">
            {todayLabel}
          </Words>
        </div>

        {/* A thin stem connecting the "Today" pill down to the track — keeps
            them reading as two distinct elements instead of one merged blob. */}
        <div
          className="absolute w-px -translate-x-1/2 bg-white/70"
          style={{ left: `${elapsedRatio * 100}%`, top: "1.25rem", bottom: "0.375rem" }}
        />

        <div className="absolute inset-x-0 bottom-0 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
            style={{ width: `${spentRatio * 100}%` }}
          />
        </div>

        <div
          className={cn(
            "absolute bottom-[-7px] left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5",
            isOverLimit ? "bg-red-500/90" : "bg-black/20",
          )}
        >
          <Words type="xxs/bold" as="span" className="flex text-white">
            {roundedPercentage}%
          </Words>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Words type="xxs/bold" as="span" className="text-white/70">
          {startLabel}
        </Words>
        <Words type="xxs/bold" as="span" className="text-white/70">
          {endLabel}
        </Words>
      </div>
    </div>
  );
}
