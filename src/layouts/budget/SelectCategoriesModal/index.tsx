import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCheck, HiOutlinePlus } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Words } from "@/components/atoms/Words";
import { Button } from "@/components/atoms/Button";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { CategoryFormModal } from "@/layouts/category/CategoryFormModal";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { cn } from "@/utils/cn";
import type { Category, CategoryType } from "@/types/category.types";

interface SelectCategoriesModalProps {
  isOpen: boolean;
  type: CategoryType;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (categories: Category[]) => void;
}

export function SelectCategoriesModal({
  isOpen,
  type,
  selectedIds,
  onClose,
  onConfirm,
}: SelectCategoriesModalProps) {
  const { t } = useTranslation();
  const { categories, createCategory } = useCategories();
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Seeded once from the budget's current selection — the parent remounts
  // this component (via a `key` keyed on open/closed) every time the modal
  // opens, so this initializer re-runs fresh instead of leaking a stale
  // in-progress selection from a previous open.
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selectedIds));

  const filteredCategories = categories.filter((category) => category.type === type);

  function toggle(idCategory: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idCategory)) next.delete(idCategory);
      else next.add(idCategory);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(filteredCategories.filter((category) => selected.has(category.idCategory)));
  }

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
          <div className="flex shrink-0 items-center justify-between gap-2">
            <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
              {t("budget.selectCategoriesTitle")}
            </Words>
            <ModalCloseButton onClose={onClose} />
          </div>

          <div className="-mx-2 min-h-0 overflow-y-auto px-2">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {filteredCategories.map((category) => {
                const Icon = resolveCategoryIcon(category.icon);
                const isSelected = selected.has(category.idCategory);

                return (
                  <button
                    key={category.idCategory}
                    type="button"
                    onClick={() => toggle(category.idCategory)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={cn(
                        "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform hover:scale-105",
                        isSelected && "ring-2 ring-inset ring-primary-500",
                      )}
                      style={{ backgroundColor: `${category.color}33` }}
                    >
                      {createElement(Icon, { className: "h-6 w-6", style: { color: category.color } })}
                      {isSelected && (
                        <span className="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white ring-2 ring-white dark:ring-ink-900">
                          <HiOutlineCheck className="h-3 w-3" />
                        </span>
                      )}
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

          <div className="flex shrink-0 gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              <Words type="sm/bold" as="span">
                {t("common.cancel")}
              </Words>
            </Button>
            <Button type="button" className="flex-1" onClick={handleConfirm}>
              <Words type="sm/bold" as="span">
                {t("common.confirm")}
              </Words>
            </Button>
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
