import { createElement, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuMinus, LuPlus } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Modal } from "@/components/molecules/Modal";
import { SubCategoryFormModal } from "@/layouts/category/SubCategoryFormModal";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category, SubCategory, SubCategoryInput } from "@/types/category.types";
import { cn } from "@/utils/cn";

interface SelectSubCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSelect: (subCategory: SubCategory | null) => void;
  /** Highlights the current pick (`null` = "Tanpa subkategori"). */
  selectedId?: string | null;
  /** Shows a back arrow (e.g. back to the category picker). */
  onBack?: () => void;
}

export function SelectSubCategoryModal({
  isOpen,
  category,
  onClose,
  onSelect,
  selectedId,
  onBack,
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title={category?.nameCategory ?? t("transaction.selectSubCategoryTitle")}
        subtitle={t("transaction.selectSubCategoryTitle")}
        onBack={onBack}
        footer={
          <Button
            type="button"
            variant="soft"
            fullWidth
            leftIcon={<LuPlus />}
            onClick={() => setIsCreateOpen(true)}
          >
            {t("transaction.newSubCategory")}
          </Button>
        }
      >
        <div className="flex flex-col gap-1">
          <SubRow
            label={t("transaction.noSubCategory")}
            icon={<LuMinus className="size-4" />}
            isSelected={selectedId === null}
            onClick={() => onSelect(null)}
          />
          {category?.subCategories.map((sub) => (
            <SubRow
              key={sub.idSubCategory}
              label={sub.nameSubCategory}
              color={category.color}
              icon={createElement(resolveCategoryIcon(sub.icon), { className: "size-4" })}
              isSelected={selectedId === sub.idSubCategory}
              onClick={() => onSelect(sub)}
            />
          ))}
        </div>
      </Modal>

      <SubCategoryFormModal
        isOpen={isCreateOpen}
        subCategory={null}
        categoryColor={category?.color ?? "#a1a1aa"}
        categoryName={category?.nameCategory}
        isSubmitting={isSubmitting}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(input) => void handleCreate(input)}
      />
    </>
  );
}

function SubRow({
  label,
  icon,
  color,
  isSelected,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  color?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        "group flex w-full items-center gap-3 rounded-control px-3.5 py-3 text-left transition-colors duration-200",
        isSelected ? "bg-primary-soft" : "hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "flex size-[34px] shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105",
          !color && "bg-surface-2 text-text-3",
        )}
        style={color ? { backgroundColor: `${color}26`, color } : undefined}
      >
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[14px]",
          isSelected ? "font-semibold text-primary-text" : "text-text",
        )}
      >
        {label}
      </span>
      {isSelected && (
        <LuCheck className="size-[18px] shrink-0 animate-scale-in text-primary-text" />
      )}
    </button>
  );
}
