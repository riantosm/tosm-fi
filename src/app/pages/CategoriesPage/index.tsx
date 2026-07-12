import { useEffect, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowsUpDown, HiOutlinePlus } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { Button } from "@/components/atoms/Button";
import { CategoryCard } from "@/layouts/category/CategoryCard";
import { CategoryReorderItem } from "@/layouts/category/CategoryReorderItem";
import { CategoryFormModal } from "@/layouts/category/CategoryFormModal";
import { SubCategoryFormModal } from "@/layouts/category/SubCategoryFormModal";
import { useCategories } from "@/hooks/use-categories";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { moveItem } from "@/utils/reorder";
import type { Category, CategoryInput, CategoryType, SubCategory, SubCategoryInput } from "@/types/category.types";

interface CategoryModalState {
  categoryId: string | null;
  defaultType: CategoryType;
}

interface SubCategoryModalState {
  categoryId: string;
  subCategoryId: string | null;
}

export function CategoriesPage() {
  const { t } = useTranslation();
  const {
    categories,
    status,
    loadCategories,
    createCategory,
    editCategory,
    deleteCategory,
    reorderCategories,
    createSubCategory,
    editSubCategory,
    deleteSubCategory,
    reorderSubCategories,
  } = useCategories();
  const { confirm } = useConfirmDialog();

  const [categoryModalState, setCategoryModalState] = useState<CategoryModalState | null>(null);
  const [subCategoryModalState, setSubCategoryModalState] = useState<SubCategoryModalState | null>(
    null,
  );

  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isSubmittingSubCategory, setIsSubmittingSubCategory] = useState(false);
  const [isDeletingSubCategory, setIsDeletingSubCategory] = useState(false);

  const [isReordering, setIsReordering] = useState(false);
  const [localOrder, setLocalOrder] = useState<Category[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (status === "idle") void loadCategories();
  }, [status, loadCategories]);

  const editingCategory = categoryModalState?.categoryId
    ? (categories.find((category) => category.idCategory === categoryModalState.categoryId) ??
      null)
    : null;

  const subCategoryParentCategory = subCategoryModalState
    ? (categories.find(
        (category) => category.idCategory === subCategoryModalState.categoryId,
      ) ?? null)
    : null;

  const editingSubCategory = subCategoryModalState?.subCategoryId
    ? (subCategoryParentCategory?.subCategories.find(
        (sub) => sub.idSubCategory === subCategoryModalState.subCategoryId,
      ) ?? null)
    : null;

  function openCreateCategoryModal(type: CategoryType) {
    setCategoryModalState({ categoryId: null, defaultType: type });
  }

  function openEditCategoryModal(category: Category) {
    setCategoryModalState({ categoryId: category.idCategory, defaultType: category.type });
  }

  function closeCategoryModal() {
    setCategoryModalState(null);
  }

  function openCreateSubCategoryModal(categoryId: string) {
    setSubCategoryModalState({ categoryId, subCategoryId: null });
  }

  function openEditSubCategoryModal(categoryId: string, subCategoryId: string) {
    setSubCategoryModalState({ categoryId, subCategoryId });
  }

  function closeSubCategoryModal() {
    setSubCategoryModalState(null);
  }

  async function handleCategorySubmit(input: CategoryInput) {
    setIsSubmittingCategory(true);
    try {
      if (categoryModalState?.categoryId) {
        await editCategory(categoryModalState.categoryId, input);
      } else {
        await createCategory(input);
      }
      closeCategoryModal();
    } finally {
      setIsSubmittingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    const confirmed = await confirm({
      title: t("category.deleteConfirmTitle"),
      description: t("category.deleteConfirmDescription"),
      confirmLabel: t("wallet.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingCategoryId(id);
    try {
      await deleteCategory(id);
      closeCategoryModal();
    } finally {
      setDeletingCategoryId(null);
    }
  }

  async function handleSubCategorySubmit(input: SubCategoryInput) {
    if (!subCategoryModalState) return;
    setIsSubmittingSubCategory(true);
    try {
      if (subCategoryModalState.subCategoryId) {
        await editSubCategory(
          subCategoryModalState.categoryId,
          subCategoryModalState.subCategoryId,
          input,
        );
      } else {
        await createSubCategory(subCategoryModalState.categoryId, input);
      }
      closeSubCategoryModal();
    } finally {
      setIsSubmittingSubCategory(false);
    }
  }

  async function handleDeleteSubCategory(subCategory: SubCategory) {
    const confirmed = await confirm({
      title: t("category.deleteSubCategoryConfirmTitle"),
      description: t("category.deleteConfirmDescription"),
      confirmLabel: t("wallet.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeletingSubCategory(true);
    try {
      await deleteSubCategory(subCategory.idCategory, subCategory.idSubCategory);
      closeSubCategoryModal();
    } finally {
      setIsDeletingSubCategory(false);
    }
  }

  function handleEnterReorder() {
    setLocalOrder(categories);
    setIsReordering(true);
  }

  function handleCancelReorder() {
    setIsReordering(false);
  }

  async function handleSaveOrder() {
    setIsSavingOrder(true);
    try {
      await reorderCategories(localOrder.map((category) => category.idCategory));
      setIsReordering(false);
    } finally {
      setIsSavingOrder(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    if (draggedId && draggedId !== targetId) {
      setLocalOrder((prev) => moveItem(prev, draggedId, targetId, (item) => item.idCategory));
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-2">
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("nav.category")}
          </Words>

          {isReordering ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="secondary" onClick={handleCancelReorder}>
                <Words type="sm/bold" as="span">
                  {t("common.cancel")}
                </Words>
              </Button>
              <Button onClick={() => void handleSaveOrder()} isLoading={isSavingOrder}>
                <Words type="sm/bold" as="span">
                  {t("category.saveOrder")}
                </Words>
              </Button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleEnterReorder}
                aria-label={t("category.toggleReorder")}
                title={t("category.toggleReorder")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
              >
                <HiOutlineArrowsUpDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => openCreateCategoryModal("expense")}
                className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
              >
                <HiOutlinePlus className="h-4 w-4" />
                <Words type="xs/bold" as="span">
                  {t("category.addCategory")}
                </Words>
              </button>
            </div>
          )}
        </div>

        {isReordering ? (
          <div className="flex flex-col gap-2">
            {localOrder.map((category) => (
              <CategoryReorderItem
                key={category.idCategory}
                category={category}
                isDragging={draggedId === category.idCategory}
                onDragStart={() => setDraggedId(category.idCategory)}
                onDragOver={(event) => handleDragOver(event, category.idCategory)}
                onDrop={(event) => event.preventDefault()}
                onDragEnd={() => setDraggedId(null)}
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-center dark:border-ink-800">
            <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
              {t("category.noCategories")}
            </Words>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.idCategory}
                category={category}
                isDeleting={deletingCategoryId === category.idCategory}
                onEdit={() => openEditCategoryModal(category)}
                onDelete={() => void handleDeleteCategory(category.idCategory)}
                onEditSubCategory={(sub) =>
                  openEditSubCategoryModal(category.idCategory, sub.idSubCategory)
                }
                onAddSubCategory={() => openCreateSubCategoryModal(category.idCategory)}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryFormModal
        isOpen={categoryModalState !== null}
        category={editingCategory}
        defaultType={categoryModalState?.defaultType ?? "expense"}
        isSubmitting={isSubmittingCategory}
        onClose={closeCategoryModal}
        onSubmit={handleCategorySubmit}
        onAddSubCategory={() => {
          if (editingCategory) openCreateSubCategoryModal(editingCategory.idCategory);
        }}
        onEditSubCategory={(sub) => {
          if (editingCategory) {
            openEditSubCategoryModal(editingCategory.idCategory, sub.idSubCategory);
          }
        }}
        onDeleteSubCategory={(sub) => void handleDeleteSubCategory(sub)}
        onReorderSubCategories={(orderedIds) => {
          if (editingCategory) void reorderSubCategories(editingCategory.idCategory, orderedIds);
        }}
      />

      <SubCategoryFormModal
        isOpen={subCategoryModalState !== null}
        subCategory={editingSubCategory}
        categoryColor={subCategoryParentCategory?.color ?? "#a1a1aa"}
        isSubmitting={isSubmittingSubCategory}
        isDeleting={isDeletingSubCategory}
        onClose={closeSubCategoryModal}
        onSubmit={handleSubCategorySubmit}
        onDelete={() => {
          if (editingSubCategory) void handleDeleteSubCategory(editingSubCategory);
        }}
      />
    </DashboardLayout>
  );
}
