import { createElement } from "react";
import { resolveBudgetIcon } from "@/layouts/budget/budget-ui";
import { cn } from "@/utils/cn";
import type { Budget } from "@/types/budget.types";
import type { Category } from "@/types/category.types";

interface BudgetTileProps {
  budget: Budget;
  categories: Category[];
  /** `onSurface` = white tile on the hero gradient instead of the tinted one. */
  variant?: "tint" | "onSurface";
  className?: string;
  iconClassName?: string;
}

export function BudgetTile({
  budget,
  categories,
  variant = "tint",
  className,
  iconClassName,
}: BudgetTileProps) {
  return (
    <span
      className={cn(
        "flex size-[42px] shrink-0 items-center justify-center rounded-[14px]",
        className,
      )}
      style={{
        backgroundColor: variant === "tint" ? `${budget.color}26` : "var(--surface)",
        color: budget.color,
      }}
    >
      {createElement(resolveBudgetIcon(budget, categories), {
        className: cn("size-[19px]", iconClassName),
      })}
    </span>
  );
}
