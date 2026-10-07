import { useEffect, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { LuArrowUpDown, LuCheck, LuInfo, LuPlus, LuTarget, LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { BudgetCard } from "@/layouts/budget/BudgetCard";
import { BudgetDetailView } from "@/layouts/budget/BudgetDetailView";
import { BudgetFormModal } from "@/layouts/budget/BudgetFormModal";
import { BudgetReorderItem } from "@/layouts/budget/BudgetReorderItem";
import { useBudgetPeriod } from "@/layouts/budget/budget-ui";
import { useBudgets } from "@/hooks/use-budgets";
import { useBudgetSpending } from "@/hooks/use-budget-spending";
import { useCategories } from "@/hooks/use-categories";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { moveByIndex, moveItem } from "@/utils/reorder";
import type { Budget, BudgetInput } from "@/types/budget.types";

type FormState = { mode: "create" } | { mode: "edit"; budget: Budget };

interface BudgetsPageLocationState {
  viewingBudgetId?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEW_MOTION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: EASE },
} as const;

export function BudgetsPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const period = useBudgetPeriod();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const {
    budgets,
    status: budgetsStatus,
    loadBudgets,
    createBudget,
    editBudget,
    deleteBudget,
    reorderBudgets,
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
  const [pinningId, setPinningId] = useState<string | null>(null);

  const [isReordering, setIsReordering] = useState(false);
  const [localOrder, setLocalOrder] = useState<Budget[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (budgetsStatus === "idle") void loadBudgets();
  }, [budgetsStatus, loadBudgets]);

  const viewingBudget = viewingBudgetId
    ? (budgets.find((budget) => budget.idBudget === viewingBudgetId) ?? null)
    : null;

  function openDetail(idBudget: string | null) {
    setViewingBudgetId(idBudget);
    window.scrollTo({ top: 0 });
  }

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
    setPinningId(budget.idBudget);
    try {
      await editBudget(budget.idBudget, { isPinned: !budget.isPinned });
      showToast(budget.isPinned ? t("budget.unpinSuccess") : t("budget.pinSuccess"), "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("budget.genericError"), "error");
    } finally {
      setPinningId(null);
    }
  }

  async function handleDelete(budget: Budget) {
    const confirmed = await confirm({
      title: t("budget.deleteConfirmTitle", { name: budget.name }),
      description: t("budget.deleteConfirmDescription"),
      confirmLabel: t("budget.deleteBudgetAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
      icon: LuTrash2,
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

  function handleEnterReorder() {
    setLocalOrder(budgets);
    setActiveId(null);
    setIsReordering(true);
  }

  function handleMove(index: number, delta: number) {
    setActiveId(localOrder[index]?.idBudget ?? null);
    setLocalOrder((prev) => moveByIndex(prev, index, delta));
  }

  async function handleSaveOrder() {
    setIsSavingOrder(true);
    try {
      await reorderBudgets(localOrder.map((budget) => budget.idBudget));
      setIsReordering(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("budget.genericError"), "error");
    } finally {
      setIsSavingOrder(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    if (draggedId && draggedId !== targetId) {
      setLocalOrder((prev) => moveItem(prev, draggedId, targetId, (item) => item.idBudget));
    }
  }

  const isInitialLoading = budgetsStatus !== "loaded" && budgets.length === 0;
  const isEmpty = budgetsStatus === "loaded" && budgets.length === 0;
  const daysLeft = Math.max(0, period.daysInMonth - period.dayOfMonth);

  const subtitle = isReordering ? (
    t("budget.reorderSubtitle")
  ) : isEmpty ? (
    t("budget.emptySubtitle", { month: period.monthName })
  ) : (
    <>
      <span className="lg:hidden">
        {t("budget.pageSubtitleShort", { month: period.monthLabel, count: daysLeft })}
      </span>
      <span className="hidden lg:inline">
        {t("budget.pageSubtitle", {
          month: period.monthLabel,
          day: period.dayOfMonth,
          total: period.daysInMonth,
          count: daysLeft,
        })}
      </span>
    </>
  );

  const openCreate = () => setFormState({ mode: "create" });

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {viewingBudget ? (
          <m.div key={`detail-${viewingBudget.idBudget}`} {...VIEW_MOTION}>
            <BudgetDetailView
              budget={viewingBudget}
              categories={categories}
              categoryBreakdown={categoryBreakdown}
              period={period}
              isLoading={isSpendingLoading || categoriesStatus !== "loaded"}
              isPinning={pinningId === viewingBudget.idBudget}
              onClose={() => openDetail(null)}
              onEdit={() => setFormState({ mode: "edit", budget: viewingBudget })}
              onTogglePin={() => void handleTogglePin(viewingBudget)}
              onSetChildLimit={(idCategory, idSubCategory, limitAmount) => {
                void setChildLimit(
                  viewingBudget.idBudget,
                  idCategory,
                  idSubCategory,
                  limitAmount,
                ).catch((error) => {
                  showToast(
                    error instanceof Error ? error.message : t("budget.genericError"),
                    "error",
                  );
                });
              }}
            />
          </m.div>
        ) : (
          <m.div key="list" {...VIEW_MOTION} className="flex flex-col gap-4 lg:gap-5">
            <PageHeader
              title={t("navShort.budgets")}
              subtitle={subtitle}
              showSubtitleOnMobile={!isEmpty}
              actions={
                isReordering ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsReordering(false)}
                      disabled={isSavingOrder}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      type="button"
                      leftIcon={<LuCheck />}
                      onClick={() => void handleSaveOrder()}
                      isLoading={isSavingOrder}
                    >
                      {t("budget.saveOrder")}
                    </Button>
                  </>
                ) : (
                  <>
                    {budgets.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        leftIcon={<LuArrowUpDown />}
                        onClick={handleEnterReorder}
                      >
                        {t("budget.toggleReorder")}
                      </Button>
                    )}
                    <Button type="button" leftIcon={<LuPlus />} onClick={openCreate}>
                      {t("budget.addBudget")}
                    </Button>
                  </>
                )
              }
              mobileActions={
                isReordering ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsReordering(false)}
                      disabled={isSavingOrder}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      leftIcon={<LuCheck />}
                      onClick={() => void handleSaveOrder()}
                      isLoading={isSavingOrder}
                    >
                      {t("wallet.saveShort")}
                    </Button>
                  </>
                ) : (
                  !isEmpty && (
                    <>
                      {budgets.length > 1 && (
                        <IconButton
                          label={t("budget.toggleReorder")}
                          icon={<LuArrowUpDown />}
                          variant="surface"
                          size="lg"
                          tooltip={false}
                          onClick={handleEnterReorder}
                        />
                      )}
                      <IconButton
                        label={t("budget.addBudget")}
                        icon={<LuPlus />}
                        variant="primary"
                        size="lg"
                        tooltip={false}
                        onClick={openCreate}
                      />
                    </>
                  )
                )
              }
            />

            <AnimatePresence mode="wait" initial={false}>
              {isReordering ? (
                <m.div
                  key="reorder"
                  {...VIEW_MOTION}
                  className="flex flex-col gap-2 lg:rounded-card lg:bg-surface lg:p-4 lg:shadow-card"
                >
                  <p className="flex items-center gap-2 rounded-control bg-primary-soft px-3.5 py-2.5 text-[12.5px] text-primary-text lg:hidden">
                    <LuInfo className="size-4 shrink-0" />
                    {t("wallet.reorderHintShort")}
                  </p>
                  {localOrder.map((budget, index) => (
                    <BudgetReorderItem
                      key={budget.idBudget}
                      budget={budget}
                      categories={categories}
                      isDragging={draggedId === budget.idBudget}
                      isActive={activeId === budget.idBudget}
                      canMoveUp={index > 0}
                      canMoveDown={index < localOrder.length - 1}
                      onMoveUp={() => handleMove(index, -1)}
                      onMoveDown={() => handleMove(index, 1)}
                      onDragStart={() => {
                        setDraggedId(budget.idBudget);
                        setActiveId(budget.idBudget);
                      }}
                      onDragOver={(event) => handleDragOver(event, budget.idBudget)}
                      onDrop={(event) => event.preventDefault()}
                      onDragEnd={() => setDraggedId(null)}
                    />
                  ))}
                </m.div>
              ) : isEmpty ? (
                <m.div key="empty" {...VIEW_MOTION}>
                  <EmptyState
                    variant="page"
                    icon={<LuTarget />}
                    title={t("budget.emptyTitle")}
                    description={
                      <>
                        <span className="lg:hidden">{t("budget.emptyDescriptionShort")}</span>
                        <span className="hidden lg:inline">{t("budget.emptyDescription")}</span>
                      </>
                    }
                    action={
                      <Button type="button" leftIcon={<LuPlus />} onClick={openCreate}>
                        {t("budget.addFirst")}
                      </Button>
                    }
                    className="min-h-[340px] lg:min-h-[560px]"
                  />
                </m.div>
              ) : (
                <m.div
                  key="grid"
                  {...VIEW_MOTION}
                  className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4 xl:grid-cols-3"
                >
                  {isInitialLoading
                    ? Array.from({ length: 3 }, (_, index) => (
                        <Skeleton key={index} className="h-[132px] rounded-card lg:h-[254px]" />
                      ))
                    : budgets.map((budget, index) => (
                        <Reveal
                          key={budget.idBudget}
                          delay={Math.min(index, 6) * 0.04}
                          className="h-full"
                        >
                          <BudgetCard
                            budget={budget}
                            categories={categories}
                            categoryBreakdown={categoryBreakdown}
                            period={period}
                            isPinning={pinningId === budget.idBudget}
                            onOpen={() => openDetail(budget.idBudget)}
                            onEdit={() => setFormState({ mode: "edit", budget })}
                            onTogglePin={() => void handleTogglePin(budget)}
                          />
                        </Reveal>
                      ))}

                  {!isInitialLoading && (
                    <>
                      <button
                        type="button"
                        onClick={openCreate}
                        className="group hidden min-h-[254px] flex-col items-center justify-center gap-3 rounded-card border border-border bg-surface/40 transition-colors duration-300 hover:border-primary hover:bg-primary-soft/40 lg:flex"
                      >
                        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-text transition-transform duration-300 group-hover:scale-110">
                          <LuPlus className="size-5" />
                        </span>
                        <span className="text-[14px] font-semibold text-primary-text">
                          {t("budget.addBudget")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={openCreate}
                        className="pressable flex h-[52px] items-center justify-center gap-2 rounded-[22px] border border-border bg-surface/50 text-[14px] font-semibold text-primary-text transition-colors hover:bg-primary-soft/40 lg:hidden"
                      >
                        <LuPlus className="size-[18px]" />
                        {t("budget.addBudget")}
                      </button>
                    </>
                  )}
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        )}
      </AnimatePresence>

      <BudgetFormModal
        isOpen={formState !== null}
        budget={formState?.mode === "edit" ? formState.budget : null}
        categories={categories}
        isSubmitting={isSubmitting}
        onClose={() => setFormState(null)}
        onSubmit={(input) => void handleSubmit(input)}
        onDelete={
          formState?.mode === "edit" ? () => void handleDelete(formState.budget) : undefined
        }
      />
    </>
  );
}
