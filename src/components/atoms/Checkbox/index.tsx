import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

/** Rounded-square checkbox; the check glyph comes from the `checkbox` utility in index.css. */
export function Checkbox({ className, ...rest }: CheckboxProps) {
  return <input type="checkbox" className={cn("checkbox", className)} {...rest} />;
}
