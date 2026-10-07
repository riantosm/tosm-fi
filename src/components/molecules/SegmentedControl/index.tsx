import { useId, type ReactNode } from "react";
import { m } from "motion/react";
import { cn } from "@/utils/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * soft  = surface-2 track + surface thumb (chart toggles, form toggles)
   * solid = surface track + primary thumb (period / month tabs)
   */
  variant?: "soft" | "solid";
  size?: "sm" | "md";
  /** Stretch options to fill the width. */
  fill?: boolean;
  className?: string;
  ariaLabel?: string;
  /** Per-option active text color override (e.g. expense tab). */
  activeClassName?: string;
  /** Overrides the sliding thumb's look (e.g. primary-soft thumb on a white track). */
  thumbClassName?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "soft",
  size = "sm",
  fill = false,
  className,
  ariaLabel,
  activeClassName,
  thumbClassName,
}: SegmentedControlProps<T>) {
  const id = useId();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full scrollbar-hide",
        variant === "soft" ? "bg-surface-2 p-[3px]" : "bg-surface p-1 shadow-card",
        fill && "flex w-full",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full transition-colors duration-200 [&_svg]:size-3.5",
              size === "sm" ? "h-[30px] px-3 text-[12.5px]" : "h-[38px] px-4 text-[13.5px]",
              fill && "flex-1",
              active
                ? cn(
                    "font-semibold",
                    variant === "soft" ? "text-text" : "text-primary-fg",
                    activeClassName,
                  )
                : "font-medium text-text-3 hover:text-text-2",
            )}
          >
            {active && (
              <m.span
                layoutId={`seg-${id}`}
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 rounded-full",
                  variant === "soft"
                    ? "bg-surface shadow-[0_2px_8px_var(--shadow-color)]"
                    : "bg-primary shadow-[0_4px_12px_color-mix(in_oklab,var(--primary)_30%,transparent)]",
                  thumbClassName,
                )}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
