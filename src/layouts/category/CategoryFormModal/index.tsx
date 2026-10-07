import { createElement, useState, type DragEvent, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuGripVertical, LuPlus, LuTrash2, LuType } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Input } from "@/components/atoms/Input";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { CategoryIconPicker } from "@/layouts/category/CategoryIconPicker";
import { CATEGORY_ICONS, resolveCategoryIcon } from "@/constants/category-icons";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { moveItem } from "@/utils/reorder";
import type { Category, CategoryInput, CategoryType, SubCategory } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface CategoryFormModalProps {
  isOpen: boolean;
  category?: Category | null;
  defaultType: CategoryType;
  isSubmitting?: boolean;
  isReorderingSubCategories?: boolean;
  /** When set (editing), a delete button sits in the header. */
  onDelete?: () => void;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: CategoryInput) => void;
  onAddSubCategory: () => void;
  onEditSubCategory: (subCategory: SubCategory) => void;
  onDeleteSubCategory: (subCategory: SubCategory) => void;
  onReorderSubCategories: (orderedIds: string[]) => void;
}

const FORM_ID = "category-form";

export function CategoryFormModal(props: CategoryFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <CategoryFormDialog key={session} {...props} />;
}

interface SubCategoryDragState {
  draggedId: string;
  order: SubCategory[];
}

function CategoryFormDialog({
  isOpen,
  category: categoryProp,
  defaultType,
  isSubmitting,
  isReorderingSubCategories,
  onDelete,
  isDeleting,
  onClose,
  onSubmit,
  onAddSubCategory,
  onEditSubCategory,
  onDeleteSubCategory,
  onReorderSubCategories,
}: CategoryFormModalProps) {
  const { t } = useTranslation();
  // Which category this dialog edits is fixed at open; its live data (subcategories) still
  // flows in, and the last value is kept while the dialog animates out after the parent clears it.
  const [isEdit] = useState(Boolean(categoryProp));
  const [lastCategory, setLastCategory] = useState(categoryProp ?? null);
  if (categoryProp && categoryProp !== lastCategory) setLastCategory(categoryProp);
  const category = categoryProp ?? lastCategory;
  const [type, setType] = useState<CategoryType>(category?.type ?? defaultType);
  const [name, setName] = useState(category?.nameCategory ?? "");
  const [color, setColor] = useState(category?.color ?? WALLET_COLOR_PRESETS[0]);
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICONS[0].name);
  const [dragState, setDragState] = useState<SubCategoryDragState | null>(null);

  const subCategories = dragState?.order ?? category?.subCategories ?? [];
  const isBusy = Boolean(isSubmitting || isDeleting);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? t("category.editTitle") : t("category.addTitle")}
      subtitle={
        isEdit && category
          ? t("wallet.transactionCount", { n: category.transactionCount })
          : undefined
      }
      headerActions={
        isEdit &&
        onDelete && (
          <IconButton
            label={t("wallet.deleteButton")}
            icon={<LuTrash2 />}
            size="sm"
            variant="danger"
            onClick={onDelete}
            disabled={isBusy}
          />
        )
      }
      footer={
        <ModalActions>
          <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            leftIcon={<LuCheck />}
            isLoading={isSubmitting}
            disabled={isBusy || !name.trim()}
          >
            {isEdit ? t("transaction.saveChanges") : t("category.saveCategory")}
          </Button>
        </ModalActions>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <SegmentedControl
          options={[
            { value: "expense", label: t("category.expense") },
            { value: "income", label: t("category.income") },
          ]}
          value={type}
          onChange={setType}
          size="md"
          fill
          activeClassName={type === "expense" ? "text-expense-text" : "text-income-text"}
          ariaLabel={t("category.typeLabel")}
        />

        <div className="flex items-start gap-3.5">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="text-[13px] font-semibold text-text-2">{t("category.iconLabel")}</span>
            <CategoryIconPicker value={icon} onChange={setIcon} color={color} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor="category-name" className="text-[13px] font-semibold text-text-2">
              {t("category.nameLabel")}
            </label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("category.namePlaceholder")}
              startIcon={<LuType />}
              required
              autoFocus={!isEdit}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-2">{t("wallet.colorLabel")}</span>
          <ColorPicker value={color} onChange={setColor} presets={WALLET_COLOR_PRESETS} />
        </div>

        {isEdit && category && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-text-2">
                {t("category.subCategoriesLabel")} · {subCategories.length}
                {isReorderingSubCategories && (
                  <IconLoader className="size-3.5 animate-spin text-text-3" />
                )}
              </span>
              {subCategories.length > 1 && (
                <span className="hidden text-[12px] text-text-3 sm:inline">
                  {t("category.dragToReorder")}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {subCategories.length === 0 && (
                <p className="rounded-control bg-surface-2 px-3.5 py-3 text-[13px] text-text-3">
                  {t("category.noSubCategories")}
                </p>
              )}
              {subCategories.map((sub) => (
                <SubCategoryListRow
                  key={sub.idSubCategory}
                  subCategory={sub}
                  categoryColor={color}
                  disabled={isReorderingSubCategories}
                  isDragging={dragState?.draggedId === sub.idSubCategory}
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

            <Button
              type="button"
              variant="soft"
              fullWidth
              leftIcon={<LuPlus />}
              onClick={onAddSubCategory}
            >
              {t("category.addSubCategory")}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}

interface SubCategoryListRowProps {
  subCategory: SubCategory;
  categoryColor: string;
  disabled?: boolean;
  isDragging?: boolean;
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
  isDragging,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SubCategoryListRowProps) {
  const { t } = useTranslation();

  return (
    <div
      onDragOver={disabled ? undefined : onDragOver}
      onDrop={disabled ? undefined : onDrop}
      className={cn(
        "flex items-center gap-2.5 rounded-control border-[1.5px] bg-surface-2 py-2 pr-2 pl-2.5 transition-[border-color,opacity] duration-200",
        isDragging ? "border-primary opacity-60" : "border-transparent",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div
        draggable={!disabled}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        role="button"
        aria-label={t("category.dragToReorder")}
        title={t("category.dragToReorder")}
        className="flex size-7 shrink-0 cursor-grab items-center justify-center text-text-3 active:cursor-grabbing"
      >
        <LuGripVertical className="size-4" />
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="group flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: `${categoryColor}26`, color: categoryColor }}
        >
          {createElement(resolveCategoryIcon(subCategory.icon), { className: "size-4" })}
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] text-text">
          {subCategory.nameSubCategory}
        </span>
        <span className="shrink-0 text-[12.5px] text-text-3 tabular">
          {t("category.trxShort", { count: subCategory.transactionCount })}
        </span>
      </button>
      <IconButton
        label={t("wallet.deleteButton")}
        icon={<LuTrash2 />}
        size="sm"
        variant="ghost"
        tooltip={false}
        className="hover:bg-expense-soft hover:text-expense-text"
        onClick={onDelete}
      />
    </div>
  );
}
