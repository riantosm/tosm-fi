export interface BudgetChildLimit {
  idCategory: string;
  /** `null` means this is the category-level limit itself (only meaningful on an "all categories" budget). */
  idSubCategory: string | null;
  limitAmount: number;
}

export interface Budget {
  idBudget: string;
  name: string;
  color: string;
  /** Empty array = covers every expense category (e.g. "Monthly Spending"); non-empty = scoped to just those categories (e.g. "Makan", "Transportasi"). */
  idCategories: string[];
  limitAmount: number;
  childLimits: BudgetChildLimit[];
  /** Shown on the Dashboard's budgets widget when true. */
  isPinned: boolean;
}

export type BudgetInput = Omit<Budget, "idBudget">;
