import type { DragEvent } from "react";
import { HiOutlineBars3, HiStar } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import type { Budget } from "@/types/budget.types";
import { cn } from "@/utils/cn";

interface BudgetReorderItemProps {
  budget: Budget;
  isDragging: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function BudgetReorderItem({
  budget,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: BudgetReorderItemProps) {
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
      style={{ borderLeftColor: budget.color }}
    >
      <HiOutlineBars3 className="h-5 w-5 shrink-0 text-ink-300 dark:text-ink-600" />
      <Words type="sm/bold" className="flex-1 truncate text-ink-900 dark:text-ink-50">
        {budget.name}
      </Words>
      {budget.isPinned && (
        <HiStar className="h-4 w-4 shrink-0 text-primary-400" />
      )}
    </div>
  );
}
