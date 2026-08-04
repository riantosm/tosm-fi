import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { HiOutlinePlus } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { BudgetCard } from "@/layouts/budget/BudgetCard";
import { BudgetDetailView } from "@/layouts/budget/BudgetDetailView";
import { BudgetFormModal } from "@/layouts/budget/BudgetFormModal";
import { useBudgets } from "@/hooks/use-budgets";
import { useBudgetSpending } from "@/hooks/use-budget-spending";
import { useCategories } from "@/hooks/use-categories";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Budget, BudgetInput } from "@/types/budget.types";

type FormState = { mode: "create" } | { mode: "edit"; budget: Budget };

interface BudgetsPageLocationState {
  viewingBudgetId?: string;
}

export function BudgetsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const {
    budgets,
    status: budgetsStatus,
    loadBudgets,
    createBudget,
    editBudget,
    deleteBudget,
    setChildLimit,
  } = useBudgets();
  const { categoryBreakdown, isLoading: isSpendingLoading } = useBudgetSpending();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  // Lets other pages (e.g. the dashboard's BudgetsSummary widget) deep-link
  // here with a specific budget's detail view already open. Read once at
  // mount via the lazy initializer — navigating here from elsewhere always
  // mounts a fresh BudgetsPage instance, so this never goes stale.
  const [viewingBudgetId, setViewingBudgetId] = useState<string | null>(
    () => (location.state as BudgetsPageLocationState | null)?.viewingBudgetId ?? null,
  );
  const [formState, setFormState] = useState<FormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (budgetsStatus === "idle") void loadBudgets();
  }, [budgetsStatus, loadBudgets]);

  const viewingBudget = viewingBudgetId
    ? (budgets.find((budget) => budget.idBudget === viewingBudgetId) ?? null)
    : null;

  async function handleSubmit(input: BudgetInput) {
    setIsSubmitting(true);
    try {
      if (formState?.mode === "edit") {
        await editBudget(formState.budget.idBudget, input);
      } else {
        await createBudget(input);
      }
      setFormState(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("budget.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTogglePin(budget: Budget) {
    try {
      await editBudget(budget.idBudget, { isPinned: !budget.isPinned });
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("budget.genericError"), "error");
    }
  }

  async function handleDelete(budget: Budget) {
    const confirmed = await confirm({
      title: t("budget.deleteConfirmTitle"),
      description: t("budget.deleteConfirmDescription", { name: budget.name }),
      confirmLabel: t("budget.deleteButton"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteBudget(budget.idBudget);
      setFormState(null);
      if (viewingBudgetId === budget.idBudget) setViewingBudgetId(null);
      showToast(t("budget.deleteSuccess"), "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("budget.genericError"), "error");
    }
  }

  return (
    <DashboardLayout>
      {viewingBudget ? (
        <BudgetDetailView
          budget={viewingBudget}
          categories={categories}
          categoryBreakdown={categoryBreakdown}
          isLoading={isSpendingLoading}
          onClose={() => setViewingBudgetId(null)}
          onEdit={() => setFormState({ mode: "edit", budget: viewingBudget })}
          onTogglePin={() => void handleTogglePin(viewingBudget)}
          onSetChildLimit={(idCategory, idSubCategory, limitAmount) => {
            void setChildLimit(viewingBudget.idBudget, idCategory, idSubCategory, limitAmount).catch(
              (error) => {
                showToast(error instanceof Error ? error.message : t("budget.genericError"), "error");
              },
            );
          }}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("budget.pageTitle")}
          </Words>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.idBudget}
                budget={budget}
                categoryBreakdown={categoryBreakdown}
                onOpen={() => setViewingBudgetId(budget.idBudget)}
                onEdit={() => setFormState({ mode: "edit", budget })}
                onTogglePin={() => void handleTogglePin(budget)}
              />
            ))}

            <button
              type="button"
              onClick={() => setFormState({ mode: "create" })}
              aria-label={t("budget.addTitle")}
              className="flex min-h-[180px] items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400"
            >
              <HiOutlinePlus className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}

      <BudgetFormModal
        isOpen={formState !== null}
        budget={formState?.mode === "edit" ? formState.budget : null}
        categories={categories}
        isSubmitting={isSubmitting}
        onClose={() => setFormState(null)}
        onSubmit={(input) => void handleSubmit(input)}
        onDelete={formState?.mode === "edit" ? () => void handleDelete(formState.budget) : undefined}
      />
    </DashboardLayout>
  );
}
