import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  startIcon?: ReactNode;
  endSlot?: ReactNode;
  hasError?: boolean;
  /** Extra classes for the outer field box (the input itself takes `className`). */
  boxClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { startIcon, endSlot, hasError, className, boxClassName, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2.5 rounded-control border border-transparent bg-surface-2 px-4",
        "transition-[background-color,border-color,box-shadow] duration-200",
        "focus-within:border-primary focus-within:bg-surface focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]",
        hasError &&
          "border-expense-text bg-surface focus-within:border-expense-text focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--expense-text)_14%,transparent)]",
        rest.disabled && "opacity-60",
        boxClassName,
      )}
    >
      {startIcon && (
        <span className="flex shrink-0 text-text-3 [&_svg]:size-[18px]">{startIcon}</span>
      )}
      <input
        ref={ref}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-[14px] text-text outline-none placeholder:text-text-3",
          "disabled:cursor-not-allowed",
          className,
        )}
        {...rest}
      />
      {endSlot}
    </div>
  );
});
