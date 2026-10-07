import type { ReactNode } from "react";
import { LuArrowRight } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface SectionHeadProps {
  /** Small uppercase label above the title (e.g. "LAPORAN · ARUS KAS"). */
  eyebrow?: string;
  title: ReactNode;
  /** Right-side link ("Lihat semua →"). */
  actionLabel?: string;
  onAction?: () => void;
  /** Arbitrary right-side content (segmented control, legend, buttons). */
  right?: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}

export function SectionHead({
  eyebrow,
  title,
  actionLabel,
  onAction,
  right,
  className,
  as: Heading = "h2",
}: SectionHeadProps) {
  return (
    <div className={cn("flex min-w-0 items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        {eyebrow && (
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3">
            {eyebrow}
          </span>
        )}
        <Heading className="truncate font-display text-[17px] font-semibold text-text lg:text-[18px]">
          {title}
        </Heading>
      </div>
      {(right || actionLabel) && (
        <div className="flex shrink-0 items-center gap-3">
          {right}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="group inline-flex items-center gap-1 rounded-full text-[13px] font-semibold text-primary-text transition-colors hover:text-primary"
            >
              {actionLabel}
              <LuArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
