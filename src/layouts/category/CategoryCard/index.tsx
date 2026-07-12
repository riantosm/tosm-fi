import { createElement } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { SubCategoryPill } from "@/layouts/category/SubCategoryPill";
import type { Category, SubCategory } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface CategoryCardProps {
  category: Category;
  isDeleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEditSubCategory: (subCategory: SubCategory) => void;
  onAddSubCategory: () => void;
}

export function CategoryCard({
  category,
  isDeleting,
  onEdit,
  onDelete,
  onEditSubCategory,
  onAddSubCategory,
}: CategoryCardProps) {
  const { t } = useTranslation();
  const icon = resolveCategoryIcon(category.icon);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onEdit} className="flex flex-1 items-center gap-3 text-left">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${category.color}33` }}
          >
            {createElement(icon, { className: "h-6 w-6", style: { color: category.color } })}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span
              className={cn(
                "inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 uppercase tracking-wide",
                category.type === "income"
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                  : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
              )}
            >
              <Words type="xs/bold" as="span">
                {category.type === "income" ? t("category.income") : t("category.expense")}
              </Words>
            </span>
            <Words type="base/bold" className="truncate text-ink-900 dark:text-ink-50">
              {category.nameCategory}
            </Words>
            <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
              {t("wallet.transactionCount", { n: category.transactionCount })}
            </Words>
          </div>
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={t("wallet.deleteButton")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          {isDeleting ? (
            <IconLoader className="h-4 w-4 animate-spin" />
          ) : (
            <HiOutlineTrash className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {category.subCategories.map((sub) => (
          <SubCategoryPill
            key={sub.idSubCategory}
            subCategory={sub}
            categoryColor={category.color}
            onClick={() => onEditSubCategory(sub)}
          />
        ))}
        <button
          type="button"
          onClick={onAddSubCategory}
          aria-label={t("category.addSubCategory")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400"
        >
          <HiOutlinePlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
