import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { LuCheck } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface OptionRowProps {
  /** Text in the leading tile ("Rp", "$", "0"). */
  leading: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

/** Single-choice row (radio card) — currency and decimal pickers. */
export function OptionRow({ leading, title, subtitle, isSelected, onSelect }: OptionRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={cn(
        "pressable flex w-full items-center gap-3 rounded-control border-[1.5px] px-3.5 py-3 text-left transition-colors duration-200",
        isSelected
          ? "border-primary bg-primary-soft"
          : "border-transparent bg-surface-2 hover:bg-surface-3",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-surface font-display text-[15px] font-semibold",
          isSelected ? "text-primary-text" : "text-text-2",
        )}
      >
        {leading}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-[14px] font-semibold text-text">{title}</span>
        {subtitle && (
          <span className="truncate font-num text-[12.5px] text-text-3 tabular">{subtitle}</span>
        )}
      </span>
      <span
        className={cn(
          "flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200",
          isSelected
            ? "border-primary bg-primary text-primary-fg"
            : "border-border-strong bg-surface",
        )}
      >
        <AnimatePresence initial={false}>
          {isSelected && (
            <m.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
            >
              <LuCheck className="size-[13px]" strokeWidth={3} />
            </m.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
