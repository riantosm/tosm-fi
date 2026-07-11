import { createElement } from "react";
import { Words } from "@/components/atoms/Words";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { SubCategory } from "@/types/category.types";

interface SubCategoryPillProps {
  subCategory: SubCategory; 
  categoryColor: string;
  onClick: () => void;
}

export function SubCategoryPill({
  subCategory, 
  categoryColor,
  onClick,
}: SubCategoryPillProps) {
  const icon = resolveCategoryIcon(subCategory.icon);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
      style={{ borderColor: categoryColor }}
    >
      {createElement(icon, { className: "h-4 w-4 shrink-0", style: { color: categoryColor } })}
      <Words
        type="sm/regular"
        as="span"
        className="whitespace-nowrap text-ink-800 dark:text-ink-200"
      >
        {subCategory.name}
      </Words> 
    </button>
  );
}
