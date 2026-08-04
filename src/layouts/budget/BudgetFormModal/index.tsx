import { createElement, useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineTrash, HiOutlinePlus, HiXMark } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Tooltip } from "@/components/atoms/Tooltip";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { SelectCategoriesModal } from "@/layouts/budget/SelectCategoriesModal";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { CURRENCIES } from "@/constants/currencies";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import { cn } from "@/utils/cn";
import type { Budget, BudgetInput } from "@/types/budget.types";
import type { Category } from "@/types/category.types";

interface BudgetFormModalProps {
  isOpen: boolean;
  budget?: Budget | null;
  categories: Category[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (input: BudgetInput) => void;
  onDelete?: () => void;
}

export function BudgetFormModal({
  isOpen,
  budget,
  categories,
  isSubmitting,
  onClose,
  onSubmit,
  onDelete,
}: BudgetFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <BudgetFormFields
          budget={budget}
          categories={categories}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Modal>
  );
}

type BudgetScope = "all" | "category";

type BudgetFormFieldsProps = Omit<BudgetFormModalProps, "isOpen">;

function BudgetFormFields({
  budget,
  categories,
  isSubmitting,
  onClose,
  onSubmit,
  onDelete,
}: BudgetFormFieldsProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const currencySymbol = CURRENCIES.find((option) => option.code === currency)?.symbol ?? "IDR";

  // `?? []` guards a `budget` rehydrated from a pre-migration redux-persist
  // snapshot that predates this field — see the same fallback in budget-breakdown.ts.
  const budgetCategoryIds = budget?.idCategories ?? [];

  const [name, setName] = useState(budget?.name ?? "");
  const [color, setColor] = useState(budget?.color ?? WALLET_COLOR_PRESETS[0]);
  const [scope, setScope] = useState<BudgetScope>(
    budgetCategoryIds.length > 0 ? "category" : "all",
  );
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(() =>
    categories.filter((category) => budgetCategoryIds.includes(category.idCategory)),
  );
  const [limitInput, setLimitInput] = useState(
    budget ? formatNumberInput(String(budget.limitAmount)) : "",
  );
  const [isPickingCategories, setIsPickingCategories] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    if (scope === "category" && selectedCategories.length === 0) return;

    onSubmit({
      name: name.trim(),
      color,
      idCategories: scope === "category" ? selectedCategories.map((category) => category.idCategory) : [],
      limitAmount: parseFormattedNumber(limitInput),
      childLimits: budget?.childLimits ?? [],
      // Not editable from this form — toggled via the star button on the
      // budget card/detail view instead, so an edit here must not reset it.
      isPinned: budget?.isPinned ?? false,
    });
  }

  function removeCategory(idCategory: string) {
    setSelectedCategories((prev) => prev.filter((category) => category.idCategory !== idCategory));
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
            {budget ? t("budget.editTitle") : t("budget.addTitle")}
          </Words>

          <div className="flex shrink-0 items-center gap-1">
            {budget && onDelete && (
              <Tooltip content={t("budget.deleteButton")}>
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label={t("budget.deleteButton")}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </Tooltip>
            )}
            <ModalCloseButton onClose={onClose} />
          </div>
        </div>

        <FormField label={t("budget.nameLabel")} htmlFor="budget-name">
          <Input
            id="budget-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("budget.namePlaceholder")}
            required
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
            {t("budget.scopeLabel")}
          </Words>
          <div className="flex rounded-xl border border-ink-200 p-1 dark:border-ink-800">
            <button
              type="button"
              onClick={() => setScope("all")}
              className={cn(
                "flex-1 rounded-lg py-2 text-center transition-colors",
                scope === "all"
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                  : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
              )}
            >
              <Words type="sm/bold" as="span">
                {t("budget.scopeAll")}
              </Words>
            </button>
            <button
              type="button"
              onClick={() => setScope("category")}
              className={cn(
                "flex-1 rounded-lg py-2 text-center transition-colors",
                scope === "category"
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                  : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
              )}
            >
              <Words type="sm/bold" as="span">
                {t("budget.scopeCategory")}
              </Words>
            </button>
          </div>
        </div>

        {scope === "category" && (
          <FormField label={t("budget.categoryLabel")} htmlFor="budget-category">
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategories.map((category) => {
                const Icon = resolveCategoryIcon(category.icon);
                return (
                  <span
                    key={category.idCategory}
                    className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white py-1 pl-1.5 pr-2 dark:border-ink-700 dark:bg-ink-900"
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${category.color}33` }}
                    >
                      {createElement(Icon, { className: "h-3.5 w-3.5", style: { color: category.color } })}
                    </div>
                    <Words type="xs/regular" as="span" className="text-ink-900 dark:text-ink-50">
                      {category.nameCategory}
                    </Words>
                    <button
                      type="button"
                      onClick={() => removeCategory(category.idCategory)}
                      aria-label={t("common.remove")}
                      className="flex h-4 w-4 shrink-0 items-center justify-center text-ink-400 hover:text-ink-600 dark:hover:text-ink-200"
                    >
                      <HiXMark className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                id="budget-category"
                onClick={() => setIsPickingCategories(true)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-ink-300 px-3 py-1.5 text-left transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-400"
              >
                <HiOutlinePlus className="h-3.5 w-3.5" />
                <Words type="xs/bold" as="span">
                  {selectedCategories.length === 0
                    ? t("budget.selectCategoryPlaceholder")
                    : t("budget.addCategoryButton")}
                </Words>
              </button>
            </div>
          </FormField>
        )}

        <FormField label={t("budget.limitLabel")} htmlFor="budget-limit">
          <Input
            id="budget-limit"
            type="text"
            inputMode="decimal"
            value={limitInput}
            onChange={(event) => setLimitInput(formatNumberInput(event.target.value))}
            placeholder="0"
            required
            startIcon={
              <Words type="sm/bold" as="span" className="text-ink-400 dark:text-ink-500">
                {currencySymbol}
              </Words>
            }
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
            {t("wallet.colorLabel")}
          </Words>
          <ColorPicker value={color} onChange={setColor} presets={WALLET_COLOR_PRESETS} />
        </div>

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

      <SelectCategoriesModal
        key={isPickingCategories ? "open" : "closed"}
        isOpen={isPickingCategories}
        type="expense"
        selectedIds={selectedCategories.map((category) => category.idCategory)}
        onClose={() => setIsPickingCategories(false)}
        onConfirm={(categoriesPicked) => {
          setSelectedCategories(categoriesPicked);
          setIsPickingCategories(false);
        }}
      />
    </>
  );
}
