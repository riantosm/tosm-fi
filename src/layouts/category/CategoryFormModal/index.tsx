import { createElement, useState, type DragEvent, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineBars3, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Words } from "@/components/atoms/Words";
import { IconLoader } from "@/components/atoms/IconLoader";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { CategoryIconPicker } from "@/layouts/category/CategoryIconPicker";
import { CATEGORY_ICONS, resolveCategoryIcon } from "@/constants/category-icons";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { moveItem } from "@/utils/reorder";
import type { Category, CategoryInput, CategoryType, SubCategory } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface CategoryFormModalProps {
  isOpen: boolean;
  category?: Category | null;
  defaultType: CategoryType;
  isSubmitting?: boolean;
  isReorderingSubCategories?: boolean;
  onClose: () => void;
  onSubmit: (input: CategoryInput) => void;
  onAddSubCategory: () => void;
  onEditSubCategory: (subCategory: SubCategory) => void;
  onDeleteSubCategory: (subCategory: SubCategory) => void;
  onReorderSubCategories: (orderedIds: string[]) => void;
}

export function CategoryFormModal({
  isOpen,
  category,
  defaultType,
  isSubmitting,
  isReorderingSubCategories,
  onClose,
  onSubmit,
  onAddSubCategory,
  onEditSubCategory,
  onDeleteSubCategory,
  onReorderSubCategories,
}: CategoryFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <CategoryFormFields
          category={category}
          defaultType={defaultType}
          isSubmitting={isSubmitting}
          isReorderingSubCategories={isReorderingSubCategories}
          onClose={onClose}
          onSubmit={onSubmit}
          onAddSubCategory={onAddSubCategory}
          onEditSubCategory={onEditSubCategory}
          onDeleteSubCategory={onDeleteSubCategory}
          onReorderSubCategories={onReorderSubCategories}
        />
      )}
    </Modal>
  );
}

type CategoryFormFieldsProps = Omit<CategoryFormModalProps, "isOpen">;

interface SubCategoryDragState {
  draggedId: string;
  order: SubCategory[];
}

function CategoryFormFields({
  category,
  defaultType,
  isSubmitting,
  isReorderingSubCategories,
  onClose,
  onSubmit,
  onAddSubCategory,
  onEditSubCategory,
  onDeleteSubCategory,
  onReorderSubCategories,
}: CategoryFormFieldsProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<CategoryType>(category?.type ?? defaultType);
  const [name, setName] = useState(category?.nameCategory ?? "");
  const [color, setColor] = useState(category?.color ?? WALLET_COLOR_PRESETS[0]);
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICONS[0].name);
  const [dragState, setDragState] = useState<SubCategoryDragState | null>(null);

  const subCategories = dragState?.order ?? category?.subCategories ?? [];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ nameCategory: name.trim(), type, color, icon });
  }

  function handleSubDragOver(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    setDragState((prev) => {
      if (!prev || prev.draggedId === targetId) return prev;
      return {
        draggedId: prev.draggedId,
        order: moveItem(prev.order, prev.draggedId, targetId, (item) => item.idSubCategory),
      };
    });
  }

  function handleSubDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (dragState) onReorderSubCategories(dragState.order.map((sub) => sub.idSubCategory));
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-5 overflow-y-auto">
      <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
        {category ? t("category.editTitle") : t("category.addTitle")}
      </Words>

      <div className="flex rounded-xl border border-ink-200 p-1 dark:border-ink-800">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={cn(
            "flex-1 rounded-lg py-2 text-center transition-colors",
            type === "expense"
              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
          )}
        >
          <Words type="sm/bold" as="span">
            {t("category.expense")}
          </Words>
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "flex-1 rounded-lg py-2 text-center transition-colors",
            type === "income"
              ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
              : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
          )}
        >
          <Words type="sm/bold" as="span">
            {t("category.income")}
          </Words>
        </button>
      </div>

      <div className="flex items-start gap-4">
        <CategoryIconPicker value={icon} onChange={setIcon} color={color} />
        <div className="flex flex-1 flex-col gap-1.5 pt-1">
          <label htmlFor="category-name">
            <Words type="sm/bold" as="span" className="text-ink-700 dark:text-ink-300">
              {t("category.nameLabel")}
            </Words>
          </label>
          <Input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("category.namePlaceholder")}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {t("wallet.colorLabel")}
        </Words>
        <ColorPicker value={color} onChange={setColor} presets={WALLET_COLOR_PRESETS} />
      </div>

      {category && (
        <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
                {t("category.subCategoriesLabel")}
              </Words>
              {isReorderingSubCategories && (
                <IconLoader className="h-3.5 w-3.5 animate-spin text-ink-400 dark:text-ink-500" />
              )}
            </div>
            <button
              type="button"
              onClick={onAddSubCategory}
              aria-label={t("category.addSubCategory")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-primary-600 dark:hover:bg-ink-800 dark:hover:text-primary-400"
            >
              <HiOutlinePlus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {subCategories.length === 0 && (
              <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
                {t("category.noSubCategories")}
              </Words>
            )}
            {subCategories.map((sub) => (
              <SubCategoryListRow
                key={sub.idSubCategory}
                subCategory={sub}
                categoryColor={category.color}
                disabled={isReorderingSubCategories}
                onEdit={() => onEditSubCategory(sub)}
                onDelete={() => onDeleteSubCategory(sub)}
                onDragStart={() =>
                  setDragState({ draggedId: sub.idSubCategory, order: category.subCategories })
                }
                onDragOver={(event) => handleSubDragOver(event, sub.idSubCategory)}
                onDrop={handleSubDrop}
                onDragEnd={() => setDragState(null)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          <Words type="sm/bold" as="span">
            {t("common.cancel")}
          </Words>
        </Button>
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          <Words type="sm/bold" as="span">
            {t("common.confirm")}
          </Words>
        </Button>
      </div>
    </form>
  );
}

interface SubCategoryListRowProps {
  subCategory: SubCategory;
  categoryColor: string;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

function SubCategoryListRow({
  subCategory,
  categoryColor,
  disabled,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SubCategoryListRowProps) {
  const { t } = useTranslation();
  const subIcon = resolveCategoryIcon(subCategory.icon);

  return (
    <div
      onDragOver={disabled ? undefined : onDragOver}
      onDrop={disabled ? undefined : onDrop}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <button type="button" onClick={onEdit} className="flex flex-1 items-center gap-3 text-left">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${categoryColor}33` }}
        >
          {createElement(subIcon, { className: "h-4 w-4", style: { color: categoryColor } })}
        </div>
        <div className="flex min-w-0 flex-col">
          <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
            {subCategory.nameSubCategory}
          </Words>
          <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
            {t("wallet.transactionCount", { n: subCategory.transactionCount })}
          </Words>
        </div>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t("wallet.deleteButton")}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        <HiOutlineTrash className="h-4 w-4" />
      </button>
      <div
        draggable={!disabled}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        role="button"
        aria-label={t("category.dragToReorder")}
        className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center text-ink-300 active:cursor-grabbing dark:text-ink-600"
      >
        <HiOutlineBars3 className="h-4 w-4" />
      </div>
    </div>
  );
}
