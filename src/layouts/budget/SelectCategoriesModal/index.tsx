import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuCheck, LuPlus } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { CategoryFormModal } from "@/layouts/category/CategoryFormModal";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCategories } from "@/hooks/use-categories";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utils/cn";
import type { Category, CategoryType } from "@/types/category.types";

interface SelectCategoriesModalProps {
  isOpen: boolean;
  type: CategoryType;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (categories: Category[]) => void;
}

export function SelectCategoriesModal(props: SelectCategoriesModalProps) {
  const session = useDialogSession(props.isOpen);
  return <SelectCategoriesDialog key={session} {...props} />;
}

function SelectCategoriesDialog({
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
  // Seeded from the budget's current pick each time the dialog opens (fresh session key).
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selectedIds));

  const filteredCategories = categories.filter((category) => category.type === type);
  const selectedCount = filteredCategories.filter((category) =>
    selected.has(category.idCategory),
  ).length;

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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onBack={onClose}
        size="lg"
        title={t("budget.selectCategoriesTitle")}
        subtitle={t("budget.selectedCount", { count: selectedCount })}
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="button" leftIcon={<LuCheck />} onClick={handleConfirm}>
              {selectedCount > 0
                ? t("budget.pickCategories", { count: selectedCount })
                : t("budget.pickCategory")}
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {filteredCategories.map((category) => {
              const isSelected = selected.has(category.idCategory);
              return (
                <button
                  key={category.idCategory}
                  type="button"
                  onClick={() => toggle(category.idCategory)}
                  aria-pressed={isSelected}
                  className={cn(
                    "group flex min-w-0 flex-col items-center gap-2 rounded-control border-[1.5px] px-1 py-3 transition-colors duration-200",
                    isSelected
                      ? "border-primary bg-primary-soft"
                      : "border-transparent bg-surface-2 hover:bg-surface-3",
                  )}
                >
                  <span
                    className="relative flex size-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: `${category.color}26`, color: category.color }}
                  >
                    {createElement(resolveCategoryIcon(category.icon), { className: "size-5" })}
                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <m.span
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 520, damping: 30 }}
                          className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-fg"
                        >
                          <LuCheck className="size-3" strokeWidth={3} />
                        </m.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span
                    className={cn(
                      "w-full truncate text-center text-[12px]",
                      isSelected ? "font-semibold text-primary-text" : "font-medium text-text-2",
                    )}
                  >
                    {category.nameCategory}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="soft"
            fullWidth
            leftIcon={<LuPlus />}
            onClick={() => setIsCreateOpen(true)}
          >
            {t("budget.newCategory")}
          </Button>
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
