import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { Budget, BudgetInput } from "@/types/budget.types";

export const budgetService = {
  async getBudgets(): Promise<Budget[]> {
    try {
      const { data } = await httpClient.get("/budgets");
      return data.data as Budget[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("budget.genericError")), { cause: error });
    }
  },

  async createBudget(input: BudgetInput): Promise<Budget> {
    try {
      const { data } = await httpClient.post("/budgets", input);
      return data.data as Budget;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("budget.genericError")), { cause: error });
    }
  },

  async updateBudget(idBudget: string, patch: Partial<BudgetInput>): Promise<Budget> {
    try {
      const { data } = await httpClient.patch(`/budgets/${idBudget}`, patch);
      return data.data as Budget;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("budget.genericError")), { cause: error });
    }
  },

  async deleteBudget(idBudget: string): Promise<void> {
    try {
      await httpClient.delete(`/budgets/${idBudget}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("budget.genericError")), { cause: error });
    }
  },

  async reorderBudgets(orderedIds: string[]): Promise<Budget[]> {
    try {
      const { data } = await httpClient.patch("/budgets/reorder", { orderedIds });
      return data.data as Budget[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("budget.genericError")), { cause: error });
    }
  },
};
