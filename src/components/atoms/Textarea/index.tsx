import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

/** Multi-line twin of `Input`: same surface-2 box, focus ring and type. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { hasError, className, rows = 3, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full resize-none rounded-control border border-transparent bg-surface-2 px-4 py-3 text-[14px] leading-[1.5] text-text outline-none placeholder:text-text-3",
        "transition-[background-color,border-color,box-shadow] duration-200",
        "focus:border-primary focus:bg-surface focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]",
        hasError && "border-expense-text bg-surface",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...rest}
    />
  );
});
