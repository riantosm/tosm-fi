import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuPin } from "react-icons/lu";
import { ReorderRow } from "@/components/molecules/ReorderRow";
import { BudgetTile } from "@/layouts/budget/BudgetTile";
import { budgetScopeLabel } from "@/layouts/budget/budget-ui";
import { useMoneyFormat } from "@/hooks/use-money-format";
import type { Budget } from "@/types/budget.types";
import type { Category } from "@/types/category.types";

interface BudgetReorderItemProps {
  budget: Budget;
  categories: Category[];
  isDragging: boolean;
  isActive?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function BudgetReorderItem({ budget, categories, ...rowProps }: BudgetReorderItemProps) {
  const { t } = useTranslation();
  const { format } = useMoneyFormat();

  return (
    <ReorderRow
      {...rowProps}
      leading={
        <BudgetTile
          budget={budget}
          categories={categories}
          className="size-[38px] rounded-[12px]"
          iconClassName="size-[18px]"
        />
      }
      title={budget.name}
      meta={budgetScopeLabel(budget, t)}
      badge={
        budget.isPinned && (
          <LuPin
            className="size-3.5 shrink-0 text-investment-text"
            aria-label={t("budget.pinnedBadge")}
          />
        )
      }
      trailing={
        <span className="hidden font-num text-[13.5px] text-text-2 tabular sm:inline">
          {format(budget.limitAmount)}
        </span>
      }
    />
  );
}
