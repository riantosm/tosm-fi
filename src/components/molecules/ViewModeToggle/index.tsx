import { useId } from "react";
import { m } from "motion/react";
import type { IconType } from "react-icons";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/utils/cn";

export interface ViewModeOption<T extends string> {
  value: T;
  icon: IconType;
  label: string;
}

interface ViewModeToggleProps<T extends string> {
  /** Exactly the modes to switch between, in display order. */
  options: ViewModeOption<T>[];
  value: T;
  onChange: (mode: T) => void;
  ariaLabel: string;
  /** pill = icon pair with a sliding thumb (desktop); icon = one button showing the next mode (phone app bar). */
  variant?: "pill" | "icon";
}

/** Grid / list (or carousel / grid) switch shared by Dompet and Investasi. */
export function ViewModeToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  variant = "pill",
}: ViewModeToggleProps<T>) {
  const thumbId = useId();

  if (variant === "icon") {
    const currentIndex = options.findIndex((option) => option.value === value);
    const next = options[(currentIndex + 1) % options.length];
    const Icon = next.icon;
    return (
      <IconButton
        label={ariaLabel}
        icon={<Icon />}
        variant="surface"
        size="lg"
        tooltip={false}
        onClick={() => onChange(next.value)}
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex h-[38px] items-center gap-0.5 rounded-full border border-border bg-surface p-[3px]"
    >
      {options.map(({ value: option, icon: Icon, label }) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            onClick={() => onChange(option)}
            className={cn(
              "relative flex size-8 items-center justify-center rounded-full transition-colors duration-200",
              isActive ? "text-primary-text" : "text-text-3 hover:text-text",
            )}
          >
            {isActive && (
              <m.span
                layoutId={`view-${thumbId}`}
                className="absolute inset-0 rounded-full bg-primary-soft"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <Icon className="relative z-10 size-4" />
          </button>
        );
      })}
    </div>
  );
}
