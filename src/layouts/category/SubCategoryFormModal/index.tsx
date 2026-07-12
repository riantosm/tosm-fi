import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { CategoryIconPicker } from "@/layouts/category/CategoryIconPicker";
import { CATEGORY_ICONS } from "@/constants/category-icons";
import type { SubCategory, SubCategoryInput } from "@/types/category.types";

interface SubCategoryFormModalProps {
  isOpen: boolean;
  subCategory?: SubCategory | null;
  categoryColor: string;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: SubCategoryInput) => void;
  onDelete?: (id: string) => void;
}

export function SubCategoryFormModal({
  isOpen,
  subCategory,
  categoryColor,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: SubCategoryFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <SubCategoryFormFields
          subCategory={subCategory}
          categoryColor={categoryColor}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Modal>
  );
}

interface SubCategoryFormFieldsProps {
  subCategory?: SubCategory | null;
  categoryColor: string;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: SubCategoryInput) => void;
  onDelete?: (id: string) => void;
}

function SubCategoryFormFields({
  subCategory,
  categoryColor,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: SubCategoryFormFieldsProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(subCategory?.nameSubCategory ?? "");
  const [icon, setIcon] = useState(subCategory?.icon ?? CATEGORY_ICONS[0].name);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ nameSubCategory: name.trim(), icon });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {subCategory ? t("category.editSubCategoryTitle") : t("category.addSubCategoryTitle")}
        </Words>

        {subCategory && (
          <button
            type="button"
            onClick={() => onDelete?.(subCategory.idSubCategory)}
            disabled={isDeleting}
            aria-label={t("wallet.deleteButton")}
            title={t("wallet.deleteButton")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            {isDeleting ? (
              <IconLoader className="h-4 w-4 animate-spin" />
            ) : (
              <HiOutlineTrash className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <CategoryIconPicker value={icon} onChange={setIcon} color={categoryColor} />
        <div className="flex flex-1 flex-col gap-1.5 pt-1">
          <label htmlFor="subcategory-name">
            <Words type="sm/bold" as="span" className="text-ink-700 dark:text-ink-300">
              {t("category.nameLabel")}
            </Words>
          </label>
          <Input
            id="subcategory-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("category.subCategoryNamePlaceholder")}
            required
          />
        </div>
      </div>

      {/* <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
        {t("category.colorFollowsCategory")}
      </Words> */}

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
