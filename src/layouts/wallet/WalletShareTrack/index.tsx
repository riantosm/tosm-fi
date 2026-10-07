import { m } from "motion/react";
import { cn } from "@/utils/cn";

interface WalletShareTrackProps {
  /** 0–100. */
  share: number;
  color: string;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Thin progress track showing a wallet's share of the total balance. */
export function WalletShareTrack({ share, color, className }: WalletShareTrackProps) {
  const width = Math.min(Math.max(share, 0), 100);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2",
        className,
      )}
    >
      <m.span
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ backgroundColor: color, minWidth: width > 0 ? 6 : 0 }}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      />
    </span>
  );
}
