import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type BadgeTone = "neutral" | "primary" | "income" | "expense" | "investment" | "solid";

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-text-2",
  primary: "bg-primary-soft text-primary-text",
  income: "bg-income-soft text-income-text",
  expense: "bg-expense-soft text-expense-text",
  investment: "bg-investment-soft text-investment-text",
  solid: "bg-primary text-primary-fg",
};

export function Badge({ tone = "neutral", icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold leading-[18px] [&_svg]:size-3",
        TONE_CLASS[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
