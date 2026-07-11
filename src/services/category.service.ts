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
      id: crypto.randomUUID(),
      name: input.name,
      type: input.type,
      color: input.color,
      icon: input.icon,
      transactionCount: 0,
      subCategories: [],
    };
  },

  async updateCategory(id: string, input: CategoryInput, current: Category): Promise<Category> {
    await delay();
    return {
      ...current,
      id,
      name: input.name,
      type: input.type,
      color: input.color,
      icon: input.icon,
    };
  },

  async deleteCategory(id: string): Promise<void> {
    await delay();
    void id;
  },

  async reorderCategories(orderedIds: string[], categories: Category[]): Promise<Category[]> {
    await delay();
    const idSet = new Set(orderedIds);
    const reordered = orderedIds
      .map((id) => categories.find((category) => category.id === id))
      .filter((category): category is Category => category !== undefined);

    let cursor = 0;
    return categories.map((category) => (idSet.has(category.id) ? reordered[cursor++] : category));
  },

  async createSubCategory(categoryId: string, input: SubCategoryInput): Promise<SubCategory> {
    await delay();
    return {
      id: crypto.randomUUID(),
      categoryId,
      name: input.name,
      icon: input.icon,
      transactionCount: 0,
    };
  },

  async updateSubCategory(
    categoryId: string,
    id: string,
    input: SubCategoryInput,
    current: SubCategory,
  ): Promise<SubCategory> {
    await delay();
    return { ...current, id, categoryId, name: input.name, icon: input.icon };
  },

  async deleteSubCategory(categoryId: string, id: string): Promise<void> {
    await delay();
    void categoryId;
    void id;
  },

  async reorderSubCategories(
    categoryId: string,
    orderedIds: string[],
    subCategories: SubCategory[],
  ): Promise<SubCategory[]> {
    await delay();
    void categoryId;
    const idSet = new Set(orderedIds);
    const reordered = orderedIds
      .map((id) => subCategories.find((sub) => sub.id === id))
      .filter((sub): sub is SubCategory => sub !== undefined);

    let cursor = 0;
    return subCategories.map((sub) => (idSet.has(sub.id) ? reordered[cursor++] : sub));
  },
};
