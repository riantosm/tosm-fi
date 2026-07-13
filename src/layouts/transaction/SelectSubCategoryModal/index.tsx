import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineNoSymbol, HiOutlinePlus } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Words } from "@/components/atoms/Words";
import { SubCategoryFormModal } from "@/layouts/category/SubCategoryFormModal";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category, SubCategory, SubCategoryInput } from "@/types/category.types";

interface SelectSubCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSelect: (subCategory: SubCategory | null) => void;
}

export function SelectSubCategoryModal({
  isOpen,
  category,
  onClose,
  onSelect,
}: SelectSubCategoryModalProps) {
  const { t } = useTranslation();
  const { createSubCategory } = useCategories();
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(input: SubCategoryInput) {
    if (!category) return;
    setIsSubmitting(true);
    try {
      await createSubCategory(category.idCategory, input);
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
            {t("transaction.selectSubCategoryTitle")}
          </Words>

          <div className="-mx-2 min-h-0 overflow-y-auto px-2">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400 transition-transform hover:scale-105 dark:bg-ink-800 dark:text-ink-500">
                  <HiOutlineNoSymbol className="h-6 w-6" />
                </div>
                <Words type="xs/regular" className="text-center text-ink-700 dark:text-ink-300">
                  {t("transaction.noSubCategory")}
                </Words>
              </button>

              {category?.subCategories.map((sub) => {
                const Icon = resolveCategoryIcon(sub.icon);

                return (
                  <button
                    key={sub.idSubCategory}
                    type="button"
                    onClick={() => onSelect(sub)}
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
                      {sub.nameSubCategory}
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

      <SubCategoryFormModal
        isOpen={isCreateOpen}
        subCategory={null}
        categoryColor={category?.color ?? "#a1a1aa"}
        isSubmitting={isSubmitting}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(input) => void handleCreate(input)}
      />
    </>
  );
}
