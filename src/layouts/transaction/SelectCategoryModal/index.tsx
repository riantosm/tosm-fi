import { createElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuPlus, LuSearch, LuSearchX } from "react-icons/lu";
import { Input } from "@/components/atoms/Input";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Modal } from "@/components/molecules/Modal";
import { CategoryFormModal } from "@/layouts/category/CategoryFormModal";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category, CategoryType } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface SelectCategoryModalProps {
  isOpen: boolean;
  type: CategoryType;
  onClose: () => void;
  onSelect: (category: Category) => void;
  /** Highlights the current pick. */
  selectedId?: string | null;
}

export function SelectCategoryModal({
  isOpen,
  type,
  onClose,
  onSelect,
  selectedId = null,
}: SelectCategoryModalProps) {
  const { t } = useTranslation();
  const { categories, createCategory } = useCategories();
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const filteredCategories = categories.filter(
    (category) =>
      category.type === type &&
      (!normalized ||
        category.nameCategory.toLowerCase().includes(normalized) ||
        category.subCategories.some((sub) =>
          sub.nameSubCategory.toLowerCase().includes(normalized),
        )),
  );

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

  function handleClose() {
    setQuery("");
    onClose();
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        title={t("transaction.selectCategoryTitle")}
        subtitle={
          type === "income" ? t("transaction.incomeCategories") : t("transaction.expenseCategories")
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("transaction.searchCategory")}
            startIcon={<LuSearch />}
            aria-label={t("transaction.searchCategory")}
          />

          {filteredCategories.length === 0 && normalized ? (
            <EmptyState icon={<LuSearchX />} title={t("transaction.noCategoryMatch")} />
          ) : (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {filteredCategories.map((category) => {
                const isSelected = category.idCategory === selectedId;
                return (
                  <button
                    key={category.idCategory}
                    type="button"
                    onClick={() => {
                      setQuery("");
                      onSelect(category);
                    }}
                    aria-pressed={isSelected}
                    className={cn(
                      "group flex min-w-0 flex-col items-center gap-2 rounded-control px-1 py-3 transition-colors duration-200",
                      isSelected ? "bg-primary-soft" : "hover:bg-surface-2",
                    )}
                  >
                    <span
                      className="flex size-[52px] items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: `${category.color}26`, color: category.color }}
                    >
                      {createElement(resolveCategoryIcon(category.icon), {
                        className: "size-[22px]",
                      })}
                    </span>
                    <span
                      className={cn(
                        "w-full truncate text-center text-[12.5px]",
                        isSelected ? "font-semibold text-primary-text" : "font-medium text-text-2",
                      )}
                    >
                      {category.nameCategory}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="group flex min-w-0 flex-col items-center gap-2 rounded-control px-1 py-3 transition-colors duration-200 hover:bg-surface-2"
              >
                <span className="flex size-[52px] items-center justify-center rounded-full border border-border bg-surface-2 text-text-2 transition-[transform,color] duration-300 group-hover:scale-105 group-hover:text-primary-text">
                  <LuPlus className="size-[22px]" />
                </span>
                <span className="w-full truncate text-center text-[12.5px] font-medium text-text-2">
                  {t("transaction.newCategoryShort")}
                </span>
              </button>
            </div>
          )}
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
