import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuTrash2, LuType } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { CategoryIconPicker } from "@/layouts/category/CategoryIconPicker";
import { CATEGORY_ICONS } from "@/constants/category-icons";
import { useDialogSession } from "@/hooks/use-dialog-session";
import type { SubCategory, SubCategoryInput } from "@/types/category.types";

interface SubCategoryFormModalProps {
  isOpen: boolean;
  subCategory?: SubCategory | null;
  categoryColor: string;
  /** Parent category name for the subtitle and the color note. */
  categoryName?: string;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: SubCategoryInput) => void;
  onDelete?: (id: string) => void;
}

const FORM_ID = "subcategory-form";

export function SubCategoryFormModal(props: SubCategoryFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <SubCategoryFormDialog key={session} {...props} />;
}

function SubCategoryFormDialog({
  isOpen,
  subCategory: subCategoryProp,
  categoryColor,
  categoryName,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: SubCategoryFormModalProps) {
  const { t } = useTranslation();
  // Frozen for this dialog's lifetime so the exit animation keeps the same content.
  const [subCategory] = useState(subCategoryProp ?? null);
  const [name, setName] = useState(subCategory?.nameSubCategory ?? "");
  const [icon, setIcon] = useState(subCategory?.icon ?? CATEGORY_ICONS[0].name);
  const isBusy = Boolean(isSubmitting || isDeleting);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ nameSubCategory: name.trim(), icon });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={subCategory ? t("category.editSubCategoryTitle") : t("category.addSubCategoryTitle")}
      subtitle={categoryName ? t("category.inCategory", { name: categoryName }) : undefined}
      headerActions={
        subCategory &&
        onDelete && (
          <IconButton
            label={t("wallet.deleteButton")}
            icon={<LuTrash2 />}
            size="sm"
            variant="danger"
            onClick={() => onDelete(subCategory.idSubCategory)}
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
            {t("transaction.save")}
          </Button>
        </ModalActions>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <div className="flex items-start gap-3.5">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="text-[13px] font-semibold text-text-2">{t("category.iconLabel")}</span>
            <CategoryIconPicker value={icon} onChange={setIcon} color={categoryColor} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor="subcategory-name" className="text-[13px] font-semibold text-text-2">
              {t("category.subNameLabel")}
            </label>
            <Input
              id="subcategory-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("category.subCategoryNamePlaceholder")}
              startIcon={<LuType />}
              required
              autoFocus={!subCategory}
            />
          </div>
        </div>

        <p className="flex items-center gap-2.5 rounded-control bg-surface-2 px-3.5 py-3 text-[12.5px] text-text-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          {categoryName
            ? t("category.colorFollowsNamed", { name: categoryName })
            : t("category.colorFollowsCategory")}
        </p>
      </form>
    </Modal>
  );
}
