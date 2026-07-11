export type CategoryType = "income" | "expense";

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  transactionCount: number;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  transactionCount: number;
  subCategories: SubCategory[];
}

export interface CategoryInput {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface SubCategoryInput {
  name: string;
  icon: string;
}
