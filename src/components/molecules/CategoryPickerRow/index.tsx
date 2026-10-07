import { createElement } from "react";
import { LuChevronRight, LuTag } from "react-icons/lu";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category, SubCategory } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface CategoryPickerRowProps {
  category: Category | null;
  subCategory?: SubCategory | null;
  placeholder: string;
  onClick: () => void;
}

/** Category + subcategory trigger row (top of AmountCard) that opens the category picker. */
export function CategoryPickerRow({
  category,
  subCategory,
  placeholder,
  onClick,
}: CategoryPickerRowProps) {
  const Icon = category ? resolveCategoryIcon(category.icon) : LuTag;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group -m-1.5 flex min-w-0 items-center gap-3 rounded-control p-1.5 text-left transition-colors duration-200 hover:bg-surface-3"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105",
          !category && "bg-surface text-text-3",
        )}
        style={
          category ? { backgroundColor: `${category.color}26`, color: category.color } : undefined
        }
      >
        {createElement(Icon, { className: "size-[18px]" })}
      </span>
      <span
        key={category?.idCategory ?? "none"}
        className="flex min-w-0 flex-1 animate-fade-in flex-col gap-px"
      >
        <span
          className={cn(
            "truncate text-[14px] font-semibold",
            category ? "text-text" : "text-text-2",
          )}
        >
          {category ? category.nameCategory : placeholder}
        </span>
        {subCategory && (
          <span className="truncate text-[12.5px] text-text-3">{subCategory.nameSubCategory}</span>
        )}
      </span>
      <LuChevronRight className="size-[18px] shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}
