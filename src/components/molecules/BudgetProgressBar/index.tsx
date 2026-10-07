import { m } from "motion/react";
import { cn } from "@/utils/cn";

interface BudgetProgressBarProps {
  /** spent / limit — may exceed 1; the fill is capped at the full width. */
  ratio: number;
  /** Fill color (budget color, or `var(--expense)` once over the limit). */
  color: string;
  /** Day-of-month "today" sits on, 1-based. */
  dayOfMonth: number;
  daysInMonth: number;
  todayLabel: string;
  /** Period start/end under the track — omit both to hide the date row. */
  startLabel?: string;
  endLabel?: string;
  /** `hero` sits on the gradient hero block (translucent track, hero colors). */
  tone?: "card" | "hero";
  className?: string;
  /** Extra classes for the date row (e.g. `hidden lg:flex`). */
  datesClassName?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Month budget bar: the fill tracks spending, the "Hari ini" pill + tick track
 * the calendar, so a fill running ahead of the tick reads as "spending too fast".
 */
export function BudgetProgressBar({
  ratio,
  color,
  dayOfMonth,
  daysInMonth,
  todayLabel,
  startLabel,
  endLabel,
  tone = "card",
  className,
  datesClassName,
}: BudgetProgressBarProps) {
  const isHero = tone === "hero";
  const todayPercent = daysInMonth > 0 ? (dayOfMonth / daysInMonth) * 100 : 0;
  const fillPercent = Math.min(1, Math.max(0, ratio)) * 100;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative h-[18px]">
        <span
          className={cn(
            "absolute top-0.5 -translate-x-1/2 rounded-full px-[7px] py-px text-[9.5px] leading-[11px] font-semibold whitespace-nowrap",
            isHero ? "bg-hero-fg text-hero-bg" : "bg-text text-surface",
          )}
          // Keeps the pill inside the bar near the first/last day of the month.
          style={{ left: `clamp(26px, ${todayPercent}%, calc(100% - 26px))` }}
        >
          {todayLabel}
        </span>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-full",
          isHero ? "h-3 bg-surface/60" : "h-2 bg-surface-2 lg:h-2.5",
        )}
      >
        <m.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        <span
          className={cn(
            "absolute inset-y-0 w-0.5 -translate-x-1/2",
            isHero ? "bg-hero-fg" : "bg-text/70",
          )}
          style={{ left: `${todayPercent}%` }}
          aria-hidden="true"
        />
      </div>

      {(startLabel || endLabel) && (
        <div
          className={cn(
            "flex items-center justify-between",
            isHero ? "text-[12px] text-hero-fg-2" : "text-[11.5px] text-text-3",
            datesClassName,
          )}
        >
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  );
}
