import type { ReactNode } from "react";
import { m } from "motion/react";
import { cn } from "@/utils/cn";

interface ProgressRingProps {
  size: number;
  thickness: number;
  /** 0–1 (clamped). */
  value: number;
  /** Arc color — a token (`var(--primary)`) or a user hex. */
  color: string;
  className?: string;
  /** Centered content (score, percentage…). */
  children?: ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Full ring with a rounded arc starting at 12 o'clock (health score, budget usage). */
export function ProgressRing({
  size,
  thickness,
  value,
  color,
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const progress = Math.min(1, Math.max(0, value));

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-surface-2"
        />
        {progress > 0 && (
          <m.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        )}
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
