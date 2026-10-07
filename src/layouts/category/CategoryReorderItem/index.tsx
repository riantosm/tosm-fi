import { createElement, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/atoms/Badge";
import { ReorderRow } from "@/components/molecules/ReorderRow";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category } from "@/types/category.types";

interface CategoryReorderItemProps {
  category: Category;
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

export function CategoryReorderItem({ category, ...rowProps }: CategoryReorderItemProps) {
  const { t } = useTranslation();
  const isIncome = category.type === "income";

  return (
    <ReorderRow
      {...rowProps}
      leading={
        <span
          className="flex size-[38px] shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${category.color}26`, color: category.color }}
        >
          {createElement(resolveCategoryIcon(category.icon), { className: "size-[18px]" })}
        </span>
      }
      title={category.nameCategory}
      trailing={
        <Badge tone={isIncome ? "income" : "expense"}>
          {isIncome ? t("category.income") : t("category.expense")}
        </Badge>
      }
    />
  );
}
