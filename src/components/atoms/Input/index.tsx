import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  startIcon?: ReactNode;
  endSlot?: ReactNode;
  hasError?: boolean;
}

export function Input({ startIcon, endSlot, hasError, className, ...rest }: InputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 transition-colors",
        "border-ink-200 focus-within:border-primary-400",
        "dark:bg-ink-900 dark:border-ink-700 dark:focus-within:border-primary-500",
        hasError && "border-red-400 dark:border-red-500",
      )}
    >
      {startIcon && <span className="text-ink-400 dark:text-ink-500">{startIcon}</span>}
      <input
        className={cn(
          "w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none",
          "dark:text-ink-100 dark:placeholder:text-ink-500",
          className,
        )}
        {...rest}
      />
      {endSlot}
    </div>
  );
}
