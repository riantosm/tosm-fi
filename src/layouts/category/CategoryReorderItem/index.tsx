import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineBars3 } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import type { Category } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface CategoryReorderItemProps {
  category: Category;
  isDragging: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function CategoryReorderItem({
  category,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: CategoryReorderItemProps) {
  const { t } = useTranslation();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "flex cursor-grab items-center gap-3 rounded-2xl border-2 border-l-4 bg-white p-4 transition-opacity active:cursor-grabbing dark:bg-ink-900",
        isDragging ? "opacity-40" : "border-ink-200 dark:border-ink-800",
      )}
      style={{ borderLeftColor: category.color }}
    >
      <HiOutlineBars3 className="h-5 w-5 shrink-0 text-ink-300 dark:text-ink-600" />
      <Words type="sm/bold" className="flex-1 truncate text-ink-900 dark:text-ink-50">
        {category.name}
      </Words>
      <span
        className={cn(
          "flex shrink-0 items-center rounded-full px-2 py-0.5 uppercase tracking-wide",
          category.type === "income"
            ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
        )}
      >
        <Words type="xs/bold" as="span">
          {category.type === "income" ? t("category.income") : t("category.expense")}
        </Words>
      </span>
    </div>
  );
}
