import { useEffect, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuArrowUpDown, LuCheck, LuInfo, LuPlus, LuTags } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { CategoryCard } from "@/layouts/category/CategoryCard";
import { CategoryReorderItem } from "@/layouts/category/CategoryReorderItem";
import { CategoryFormModal } from "@/layouts/category/CategoryFormModal";
import { SubCategoryFormModal } from "@/layouts/category/SubCategoryFormModal";
import { useCategories } from "@/hooks/use-categories";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { moveByIndex, moveItem } from "@/utils/reorder";
import type {
  Category,
  CategoryInput,
  CategoryType,
  SubCategory,
  SubCategoryInput,
} from "@/types/category.types";

type TypeFilter = "all" | CategoryType;

const EASE = [0.22, 1, 0.36, 1] as const;

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
  const { showToast } = useToast();

  const subCategoryCount = categories.reduce(
    (sum, category) => sum + category.subCategories.length,
    0,
  );

  const [categoryModalState, setCategoryModalState] = useState<CategoryModalState | null>(null);
  const [subCategoryModalState, setSubCategoryModalState] = useState<SubCategoryModalState | null>(
    null,
  );

  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isSubmittingSubCategory, setIsSubmittingSubCategory] = useState(false);
  const [isDeletingSubCategory, setIsDeletingSubCategory] = useState(false);
  const [isReorderingSubCategories, setIsReorderingSubCategories] = useState(false);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [isReordering, setIsReordering] = useState(false);
  const [localOrder, setLocalOrder] = useState<Category[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (status === "idle") void loadCategories();
  }, [status, loadCategories]);

  const editingCategory = categoryModalState?.categoryId
    ? (categories.find((category) => category.idCategory === categoryModalState.categoryId) ?? null)
    : null;

  const subCategoryParentCategory = subCategoryModalState
    ? (categories.find((category) => category.idCategory === subCategoryModalState.categoryId) ??
      null)
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
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("category.genericError"), "error");
    } finally {
      setIsSubmittingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    const category = categories.find((item) => item.idCategory === id);
    const subNames = category?.subCategories.map((sub) => sub.nameSubCategory) ?? [];
    const confirmed = await confirm({
      title: t("category.deleteConfirmTitle", { name: category?.nameCategory ?? "" }),
      description:
        subNames.length > 0
          ? t("category.deleteConfirmWithSubs", {
              count: subNames.length,
              names: subNames.join(", "),
            })
          : t("category.deleteConfirmNoSubs"),
      confirmLabel: t("category.deleteCategoryAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingCategoryId(id);
    try {
      await deleteCategory(id);
      closeCategoryModal();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("category.genericError"), "error");
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
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("category.genericError"), "error");
    } finally {
      setIsSubmittingSubCategory(false);
    }
  }

  async function handleDeleteSubCategory(subCategory: SubCategory) {
    const confirmed = await confirm({
      title: t("category.deleteSubCategoryConfirmTitle", { name: subCategory.nameSubCategory }),
      description: t("category.deleteSubConfirmDescription"),
      confirmLabel: t("wallet.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeletingSubCategory(true);
    try {
      await deleteSubCategory(subCategory.idCategory, subCategory.idSubCategory);
      closeSubCategoryModal();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("category.genericError"), "error");
    } finally {
      setIsDeletingSubCategory(false);
    }
  }

  function handleEnterReorder() {
    setLocalOrder(categories);
    setActiveId(null);
    setIsReordering(true);
  }

  function handleMove(index: number, delta: number) {
    setActiveId(localOrder[index]?.idCategory ?? null);
    setLocalOrder((prev) => moveByIndex(prev, index, delta));
  }

  function handleCancelReorder() {
    setIsReordering(false);
  }

  async function handleReorderSubCategories(categoryId: string, orderedIds: string[]) {
    setIsReorderingSubCategories(true);
    try {
      await reorderSubCategories(categoryId, orderedIds);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("category.genericError"), "error");
    } finally {
      setIsReorderingSubCategories(false);
    }
  }

  async function handleSaveOrder() {
    setIsSavingOrder(true);
    try {
      await reorderCategories(localOrder.map((category) => category.idCategory));
      setIsReordering(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("category.genericError"), "error");
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

  const visibleCategories =
    typeFilter === "all"
      ? categories
      : categories.filter((category) => category.type === typeFilter);
  const isEmpty = status === "loaded" && categories.length === 0;
  const isInitialLoading = status !== "loaded" && categories.length === 0;
  const countLabel = `${t("category.categoryCountLabel", { count: categories.length })} · ${t("category.subCategoryCountLabel", { count: subCategoryCount })}`;
  const subtitle = isReordering
    ? t("category.reorderSubtitle")
    : isEmpty
      ? t("category.noCategories")
      : countLabel;

  const typeTabs = (
    <SegmentedControl
      options={[
        { value: "all", label: t("common.all") },
        { value: "expense", label: t("category.expense") },
        { value: "income", label: t("category.income") },
      ]}
      value={typeFilter}
      onChange={setTypeFilter}
      size="md"
      thumbClassName="bg-primary-soft shadow-none"
      activeClassName="text-primary-text"
      className="bg-surface shadow-card"
    />
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("nav.category")}
        subtitle={subtitle}
        showSubtitleOnMobile={false}
        actions={
          isReordering ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelReorder}
                disabled={isSavingOrder}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                leftIcon={<LuCheck />}
                onClick={() => void handleSaveOrder()}
                isLoading={isSavingOrder}
              >
                {t("category.saveOrder")}
              </Button>
            </>
          ) : (
            <>
              {!isEmpty && typeTabs}
              {categories.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<LuArrowUpDown />}
                  onClick={handleEnterReorder}
                >
                  {t("category.toggleReorder")}
                </Button>
              )}
              <Button
                type="button"
                leftIcon={<LuPlus />}
                onClick={() =>
                  openCreateCategoryModal(typeFilter === "income" ? "income" : "expense")
                }
              >
                {t("category.addCategory")}
              </Button>
            </>
          )
        }
        mobileActions={
          isReordering ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancelReorder}
                disabled={isSavingOrder}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                leftIcon={<LuCheck />}
                onClick={() => void handleSaveOrder()}
                isLoading={isSavingOrder}
              >
                {t("wallet.saveShort")}
              </Button>
            </>
          ) : (
            <>
              {categories.length > 1 && (
                <IconButton
                  label={t("category.toggleReorder")}
                  icon={<LuArrowUpDown />}
                  variant="surface"
                  size="lg"
                  tooltip={false}
                  onClick={handleEnterReorder}
                />
              )}
              <IconButton
                label={t("category.addCategory")}
                icon={<LuPlus />}
                variant="primary"
                size="lg"
                tooltip={false}
                onClick={() =>
                  openCreateCategoryModal(typeFilter === "income" ? "income" : "expense")
                }
              />
            </>
          )
        }
      />

      {!isReordering && !isEmpty && (
        <div className="-mt-1 flex flex-col gap-2 lg:hidden">
          <div className="[&>div]:flex [&>div]:w-full [&_button]:flex-1">{typeTabs}</div>
          <p className="px-1 text-[12.5px] text-text-3">{countLabel}</p>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {isReordering ? (
          <m.div
            key="reorder"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex flex-col gap-2 lg:rounded-card lg:bg-surface lg:p-4 lg:shadow-card"
          >
            <p className="flex items-center gap-2 rounded-control bg-primary-soft px-3.5 py-2.5 text-[12.5px] text-primary-text lg:hidden">
              <LuInfo className="size-4 shrink-0" />
              {t("wallet.reorderHintShort")}
            </p>
            {localOrder.map((category, index) => (
              <CategoryReorderItem
                key={category.idCategory}
                category={category}
                isDragging={draggedId === category.idCategory}
                isActive={activeId === category.idCategory}
                canMoveUp={index > 0}
                canMoveDown={index < localOrder.length - 1}
                onMoveUp={() => handleMove(index, -1)}
                onMoveDown={() => handleMove(index, 1)}
                onDragStart={() => {
                  setDraggedId(category.idCategory);
                  setActiveId(category.idCategory);
                }}
                onDragOver={(event) => handleDragOver(event, category.idCategory)}
                onDrop={(event) => event.preventDefault()}
                onDragEnd={() => setDraggedId(null)}
              />
            ))}
          </m.div>
        ) : isEmpty ? (
          <m.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <EmptyState
              variant="page"
              icon={<LuTags />}
              title={t("category.noCategories")}
              description={t("category.emptyDescription")}
              action={
                <Button
                  type="button"
                  leftIcon={<LuPlus />}
                  onClick={() => openCreateCategoryModal("expense")}
                >
                  {t("category.addFirst")}
                </Button>
              }
              className="min-h-[360px] lg:min-h-[520px]"
            />
          </m.div>
        ) : (
          <m.div
            key={`list-${typeFilter}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4"
          >
            {isInitialLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-[132px] rounded-card lg:h-[153px]" />
                ))
              : visibleCategories.map((category, index) => (
                  <Reveal key={category.idCategory} delay={Math.min(index, 6) * 0.04}>
                    <CategoryCard
                      category={category}
                      isDeleting={deletingCategoryId === category.idCategory}
                      onEdit={() => openEditCategoryModal(category)}
                      onDelete={() => void handleDeleteCategory(category.idCategory)}
                      onEditSubCategory={(sub) =>
                        openEditSubCategoryModal(category.idCategory, sub.idSubCategory)
                      }
                      onAddSubCategory={() => openCreateSubCategoryModal(category.idCategory)}
                    />
                  </Reveal>
                ))}
          </m.div>
        )}
      </AnimatePresence>

      <CategoryFormModal
        isOpen={categoryModalState !== null}
        category={editingCategory}
        defaultType={categoryModalState?.defaultType ?? "expense"}
        isSubmitting={isSubmittingCategory}
        isDeleting={deletingCategoryId !== null}
        onDelete={
          editingCategory ? () => void handleDeleteCategory(editingCategory.idCategory) : undefined
        }
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
        isReorderingSubCategories={isReorderingSubCategories}
        onReorderSubCategories={(orderedIds) => {
          if (editingCategory)
            void handleReorderSubCategories(editingCategory.idCategory, orderedIds);
        }}
      />

      <SubCategoryFormModal
        isOpen={subCategoryModalState !== null}
        subCategory={editingSubCategory}
        categoryColor={subCategoryParentCategory?.color ?? "#a1a1aa"}
        categoryName={subCategoryParentCategory?.nameCategory}
        isSubmitting={isSubmittingSubCategory}
        isDeleting={isDeletingSubCategory}
        onClose={closeSubCategoryModal}
        onSubmit={handleSubCategorySubmit}
        onDelete={() => {
          if (editingSubCategory) void handleDeleteSubCategory(editingSubCategory);
        }}
      />
    </div>
  );
}
