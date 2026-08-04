import { useCallback } from "react";
import { budgetService } from "@/services/budget.service";
import type { BudgetInput } from "@/types/budget.types";
import {
  addBudget,
  removeBudget,
  setBudgets,
  setBudgetsLoading,
  updateBudgetInState,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useBudgets() {
  const dispatch = useAppDispatch();
  const budgets = useAppSelector((state) => state.budget.budgets);
  const status = useAppSelector((state) => state.budget.status);

  const loadBudgets = useCallback(async () => {
    dispatch(setBudgetsLoading());
    const data = await budgetService.getBudgets();
    dispatch(setBudgets(data));
  }, [dispatch]);

  const createBudget = useCallback(
    async (input: BudgetInput) => {
      const created = await budgetService.createBudget(input);
      dispatch(addBudget(created));
      return created;
    },
    [dispatch],
  );

  const editBudget = useCallback(
    async (idBudget: string, patch: Partial<BudgetInput>) => {
      const updated = await budgetService.updateBudget(idBudget, patch);
      dispatch(updateBudgetInState(updated));
      return updated;
    },
    [dispatch],
  );

  const deleteBudget = useCallback(
    async (idBudget: string) => {
      await budgetService.deleteBudget(idBudget);
      dispatch(removeBudget(idBudget));
    },
    [dispatch],
  );

  // A `limitAmount` of 0 clears the row back to "no limit set" rather than
  // storing a literal zero-cap — matches how the breakdown UI treats `null`.
  const setChildLimit = useCallback(
    async (
      idBudget: string,
      idCategory: string,
      idSubCategory: string | null,
      limitAmount: number,
    ) => {
      const budget = budgets.find((item) => item.idBudget === idBudget);
      if (!budget) return;

      const withoutExisting = budget.childLimits.filter(
        (limit) => !(limit.idCategory === idCategory && limit.idSubCategory === idSubCategory),
      );
      const childLimits =
        limitAmount > 0
          ? [...withoutExisting, { idCategory, idSubCategory, limitAmount }]
          : withoutExisting;

      return editBudget(idBudget, { childLimits });
    },
    [budgets, editBudget],
  );

  return { budgets, status, loadBudgets, createBudget, editBudget, deleteBudget, setChildLimit };
}
