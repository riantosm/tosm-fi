import { MOCK_CATEGORIES } from "@/constants/mock-categories";
import type {
  Category,
  CategoryInput,
  SubCategory,
  SubCategoryInput,
} from "@/types/category.types";

const FAKE_LATENCY_MS = 500;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

export const categoryService = {
  async fetchCategories(): Promise<Category[]> {
    await delay();
    return MOCK_CATEGORIES;
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    await delay();
    return {
      idCategory: crypto.randomUUID(),
      nameCategory: input.nameCategory,
      type: input.type,
      color: input.color,
      icon: input.icon,
      transactionCount: 0,
      subCategories: [],
    };
  },

  async updateCategory(
    idCategory: string,
    input: CategoryInput,
    current: Category,
  ): Promise<Category> {
    await delay();
    return {
      ...current,
      idCategory,
      nameCategory: input.nameCategory,
      type: input.type,
      color: input.color,
      icon: input.icon,
    };
  },

  async deleteCategory(idCategory: string): Promise<void> {
    await delay();
    void idCategory;
  },

  async reorderCategories(orderedIds: string[], categories: Category[]): Promise<Category[]> {
    await delay();
    const idSet = new Set(orderedIds);
    const reordered = orderedIds
      .map((id) => categories.find((category) => category.idCategory === id))
      .filter((category): category is Category => category !== undefined);

    let cursor = 0;
    return categories.map((category) =>
      idSet.has(category.idCategory) ? reordered[cursor++] : category,
    );
  },

  async createSubCategory(idCategory: string, input: SubCategoryInput): Promise<SubCategory> {
    await delay();
    return {
      idSubCategory: crypto.randomUUID(),
      idCategory,
      nameSubCategory: input.nameSubCategory,
      icon: input.icon,
      transactionCount: 0,
    };
  },

  async updateSubCategory(
    idCategory: string,
    idSubCategory: string,
    input: SubCategoryInput,
    current: SubCategory,
  ): Promise<SubCategory> {
    await delay();
    return {
      ...current,
      idSubCategory,
      idCategory,
      nameSubCategory: input.nameSubCategory,
      icon: input.icon,
    };
  },

  async deleteSubCategory(idCategory: string, idSubCategory: string): Promise<void> {
    await delay();
    void idCategory;
    void idSubCategory;
  },

  async reorderSubCategories(
    idCategory: string,
    orderedIds: string[],
    subCategories: SubCategory[],
  ): Promise<SubCategory[]> {
    await delay();
    void idCategory;
    const idSet = new Set(orderedIds);
    const reordered = orderedIds
      .map((id) => subCategories.find((sub) => sub.idSubCategory === id))
      .filter((sub): sub is SubCategory => sub !== undefined);

    let cursor = 0;
    return subCategories.map((sub) =>
      idSet.has(sub.idSubCategory) ? reordered[cursor++] : sub,
    );
  },
};
