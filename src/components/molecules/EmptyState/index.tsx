import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** compact = inside a card (soft box); page = large standalone empty page. */
  variant?: "compact" | "page";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "compact",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex animate-fade-in flex-col items-center justify-center gap-3 text-center",
        variant === "compact"
          ? "rounded-control bg-surface-2 px-5 py-8"
          : "rounded-card bg-surface px-6 py-14 shadow-card",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex items-center justify-center rounded-full text-text-3",
            variant === "compact"
              ? "size-11 bg-surface [&_svg]:size-5"
              : "size-14 bg-primary-soft text-primary-text [&_svg]:size-6",
          )}
        >
          {icon}
        </span>
      )}
      <div className="flex max-w-md flex-col gap-1">
        <p
          className={cn(
            "font-semibold text-text",
            variant === "compact" ? "text-[14px]" : "font-display text-[20px]",
          )}
        >
          {title}
        </p>
        {description && <p className="text-[13px] leading-relaxed text-text-3">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
