import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...rest }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded-md border-ink-300 text-primary-600 accent-primary-600",
        "dark:border-ink-600 dark:accent-primary-400",
        className,
      )}
      {...rest}
    />
  );
}
