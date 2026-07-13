import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Words } from "@/components/atoms/Words";
import { CategoryFormModal } from "@/layouts/category/CategoryFormModal";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category, CategoryType } from "@/types/category.types";

interface SelectCategoryModalProps {
  isOpen: boolean;
  type: CategoryType;
  onClose: () => void;
  onSelect: (category: Category) => void;
}

export function SelectCategoryModal({ isOpen, type, onClose, onSelect }: SelectCategoryModalProps) {
  const { t } = useTranslation();
  const { categories, createCategory } = useCategories();
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter((category) => category.type === type);

  async function handleCreate(input: Parameters<typeof createCategory>[0]) {
    setIsSubmitting(true);
    try {
      await createCategory(input);
      setIsCreateOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("category.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex max-h-[75vh] flex-col gap-4">
          <Words as="h2" type="lg/bold" className="shrink-0 text-ink-900 dark:text-ink-50">
            {t("transaction.selectCategoryTitle")}
          </Words>

          <div className="-mx-2 min-h-0 overflow-y-auto px-2">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {filteredCategories.map((category) => {
                const Icon = resolveCategoryIcon(category.icon);

                return (
                  <button
                    key={category.idCategory}
                    type="button"
                    onClick={() => onSelect(category)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform hover:scale-105"
                      style={{ backgroundColor: `${category.color}33` }}
                    >
                      {createElement(Icon, { className: "h-6 w-6", style: { color: category.color } })}
                    </div>
                    <Words
                      type="xs/regular"
                      className="line-clamp-1 text-center text-ink-700 dark:text-ink-300"
                    >
                      {category.nameCategory}
                    </Words>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400">
                  <HiOutlinePlus className="h-6 w-6" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <CategoryFormModal
        isOpen={isCreateOpen}
        category={null}
        defaultType={type}
        isSubmitting={isSubmitting}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(input) => void handleCreate(input)}
        onAddSubCategory={() => {}}
        onEditSubCategory={() => {}}
        onDeleteSubCategory={() => {}}
        onReorderSubCategories={() => {}}
      />
    </>
  );
}
