import { createElement, useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuBanknote, LuCheck, LuPlus, LuTrash2, LuType, LuX } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { SelectCategoriesModal } from "@/layouts/budget/SelectCategoriesModal";
import { useBudgetPeriod } from "@/layouts/budget/budget-ui";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
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

type BudgetScope = "all" | "category";

const FORM_ID = "budget-form";
const EASE = [0.22, 1, 0.36, 1] as const;

export function BudgetFormModal(props: BudgetFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <BudgetFormDialog key={session} {...props} />;
}

function BudgetFormDialog({
  isOpen,
  budget: budgetProp,
  categories,
  isSubmitting,
  onClose,
  onSubmit,
  onDelete,
}: BudgetFormModalProps) {
  const { t } = useTranslation();
  const { monthLabel } = useBudgetPeriod();
  // Frozen for this dialog's lifetime so the exit animation keeps the same budget.
  const [budget] = useState(budgetProp ?? null);

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

  const isScopeValid = scope === "all" || selectedCategories.length > 0;
  const canSubmit = Boolean(name.trim()) && isScopeValid && limitInput.trim() !== "";

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      name: name.trim(),
      color,
      idCategories:
        scope === "category" ? selectedCategories.map((category) => category.idCategory) : [],
      limitAmount: parseFormattedNumber(limitInput),
      childLimits: budget?.childLimits ?? [],
      // Not editable from this form — toggled via the pin button on the
      // budget card/detail view instead, so an edit here must not reset it.
      isPinned: budget?.isPinned ?? false,
    });
  }

  function removeCategory(idCategory: string) {
    setSelectedCategories((prev) => prev.filter((category) => category.idCategory !== idCategory));
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={budget ? t("budget.editTitle") : t("budget.addTitle")}
        subtitle={t("budget.appliesTo", { month: monthLabel })}
        headerActions={
          budget &&
          onDelete && (
            <IconButton
              label={t("budget.deleteButton")}
              icon={<LuTrash2 />}
              size="sm"
              variant="danger"
              onClick={onDelete}
              disabled={isSubmitting}
            />
          )
        }
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              leftIcon={<LuCheck />}
              isLoading={isSubmitting}
              disabled={isSubmitting || !canSubmit}
            >
              {budget ? t("transaction.saveChanges") : t("budget.saveBudget")}
            </Button>
          </ModalActions>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <FormField label={t("budget.nameLabel")} htmlFor="budget-name">
            <Input
              id="budget-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("budget.namePlaceholder")}
              startIcon={<LuType />}
              required
              autoFocus={!budget}
            />
          </FormField>

          <div className="flex flex-col">
            <span className="pb-2 text-[13px] font-semibold text-text-2">
              {t("budget.scopeLabel")}
            </span>
            <SegmentedControl
              options={[
                { value: "all", label: t("budget.scopeAll") },
                { value: "category", label: t("budget.scopeCategory") },
              ]}
              value={scope}
              onChange={setScope}
              size="md"
              fill
              activeClassName="text-primary-text"
              ariaLabel={t("budget.scopeLabel")}
            />

            <AnimatePresence initial={false}>
              {scope === "category" && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-2 pt-2.5">
                    <AnimatePresence initial={false}>
                      {selectedCategories.map((category) => (
                        <m.span
                          key={category.idCategory}
                          layout
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-1.5 rounded-full py-1 pr-1 pl-2.5"
                          style={{ backgroundColor: `${category.color}1F` }}
                        >
                          {createElement(resolveCategoryIcon(category.icon), {
                            className: "size-3.5 shrink-0",
                            style: { color: category.color },
                          })}
                          <span className="max-w-[160px] truncate text-[12.5px] font-medium text-text">
                            {category.nameCategory}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCategory(category.idCategory)}
                            aria-label={t("common.remove")}
                            className="flex size-5 shrink-0 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-surface/70 hover:text-text"
                          >
                            <LuX className="size-3.5" />
                          </button>
                        </m.span>
                      ))}
                    </AnimatePresence>
                    <m.button
                      layout
                      type="button"
                      onClick={() => setIsPickingCategories(true)}
                      className="flex items-center gap-1.5 rounded-full border border-primary px-3 py-[5px] text-[12.5px] font-semibold text-primary-text transition-colors hover:bg-primary-soft"
                    >
                      <LuPlus className="size-3.5" />
                      {selectedCategories.length === 0
                        ? t("budget.selectCategoryPlaceholder")
                        : t("budget.addCategoryButton")}
                    </m.button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          <FormField label={t("budget.limitLabel")} htmlFor="budget-limit">
            <Input
              id="budget-limit"
              type="text"
              inputMode="decimal"
              value={limitInput}
              onChange={(event) => setLimitInput(formatNumberInput(event.target.value))}
              placeholder="0"
              startIcon={<LuBanknote />}
              className="font-num tabular"
              required
            />
          </FormField>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-text-2">{t("wallet.colorLabel")}</span>
            <ColorPicker value={color} onChange={setColor} presets={WALLET_COLOR_PRESETS} />
          </div>
        </form>
      </Modal>

      <SelectCategoriesModal
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
