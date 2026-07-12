import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Category, SubCategory } from "@/types/category.types";

export type CategoryLoadStatus = "idle" | "loading" | "loaded";

export interface ICategoryReduxState {
  categories: Category[];
  status: CategoryLoadStatus;
}

const initialState: ICategoryReduxState = {
  categories: [],
  status: "idle",
};

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategoriesLoading: (state) => {
      state.status = "loading";
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.status = "loaded";
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        (category) => category.idCategory === action.payload.idCategory,
      );
      if (index !== -1) state.categories[index] = action.payload;
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (category) => category.idCategory !== action.payload,
      );
    },
    addSubCategory: (
      state,
      action: PayloadAction<{ categoryId: string; subCategory: SubCategory }>,
    ) => {
      const category = state.categories.find(
        (item) => item.idCategory === action.payload.categoryId,
      );
      if (category) category.subCategories.push(action.payload.subCategory);
    },
    updateSubCategory: (
      state,
      action: PayloadAction<{ categoryId: string; subCategory: SubCategory }>,
    ) => {
      const category = state.categories.find(
        (item) => item.idCategory === action.payload.categoryId,
      );
      if (!category) return;
      const index = category.subCategories.findIndex(
        (sub) => sub.idSubCategory === action.payload.subCategory.idSubCategory,
      );
      if (index !== -1) category.subCategories[index] = action.payload.subCategory;
    },
    removeSubCategory: (
      state,
      action: PayloadAction<{ categoryId: string; subCategoryId: string }>,
    ) => {
      const category = state.categories.find(
        (item) => item.idCategory === action.payload.categoryId,
      );
      if (!category) return;
      category.subCategories = category.subCategories.filter(
        (sub) => sub.idSubCategory !== action.payload.subCategoryId,
      );
    },
    setSubCategoryOrder: (
      state,
      action: PayloadAction<{ categoryId: string; subCategories: SubCategory[] }>,
    ) => {
      const category = state.categories.find(
        (item) => item.idCategory === action.payload.categoryId,
      );
      if (category) category.subCategories = action.payload.subCategories;
    },
    resetCategories: () => initialState,
  },
});

export const {
  setCategoriesLoading,
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  addSubCategory,
  updateSubCategory,
  removeSubCategory,
  setSubCategoryOrder,
  resetCategories,
} = categorySlice.actions;

export default categorySlice.reducer;
