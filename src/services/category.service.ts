import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  Category,
  CategoryInput,
  SubCategory,
  SubCategoryInput,
} from "@/types/category.types";

export const categoryService = {
  async fetchCategories(): Promise<Category[]> {
    try {
      const { data } = await httpClient.get("/categories");
      return data.data as Category[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    try {
      const { data } = await httpClient.post("/categories", input);
      return data.data as Category;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async updateCategory(idCategory: string, input: CategoryInput): Promise<Category> {
    try {
      const { data } = await httpClient.patch(`/categories/${idCategory}`, input);
      return data.data as Category;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async deleteCategory(idCategory: string): Promise<void> {
    try {
      await httpClient.delete(`/categories/${idCategory}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async reorderCategories(orderedIds: string[]): Promise<Category[]> {
    try {
      const { data } = await httpClient.patch("/categories/reorder", { orderedIds });
      return data.data as Category[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async createSubCategory(idCategory: string, input: SubCategoryInput): Promise<SubCategory> {
    try {
      const { data } = await httpClient.post(`/categories/${idCategory}/subcategories`, input);
      return data.data as SubCategory;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async updateSubCategory(
    idCategory: string,
    idSubCategory: string,
    input: SubCategoryInput,
  ): Promise<SubCategory> {
    try {
      const { data } = await httpClient.patch(
        `/categories/${idCategory}/subcategories/${idSubCategory}`,
        input,
      );
      return data.data as SubCategory;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async deleteSubCategory(idCategory: string, idSubCategory: string): Promise<void> {
    try {
      await httpClient.delete(`/categories/${idCategory}/subcategories/${idSubCategory}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },

  async reorderSubCategories(idCategory: string, orderedIds: string[]): Promise<SubCategory[]> {
    try {
      const { data } = await httpClient.patch(
        `/categories/${idCategory}/subcategories/reorder`,
        { orderedIds },
      );
      return data.data as SubCategory[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("category.genericError")));
    }
  },
};
