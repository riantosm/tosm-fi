import { createElement } from "react";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { SubCategory } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface SubCategoryPillProps {
  subCategory: SubCategory;
  categoryColor: string;
  onClick: () => void;
  className?: string;
  tabIndex?: number;
}

/** Subcategory chip tinted with its category color (icon + name, one line). */
export function SubCategoryPill({
  subCategory,
  categoryColor,
  onClick,
  className,
  tabIndex,
}: SubCategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      className={cn(
        "pressable flex h-8 max-w-[180px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium text-text transition-[filter] hover:brightness-[0.97]",
        className,
      )}
      style={{ borderColor: `${categoryColor}59`, backgroundColor: `${categoryColor}14` }}
    >
      {createElement(resolveCategoryIcon(subCategory.icon), {
        className: "size-3.5 shrink-0",
        style: { color: categoryColor },
      })}
      <span className="truncate">{subCategory.nameSubCategory}</span>
    </button>
  );
}
