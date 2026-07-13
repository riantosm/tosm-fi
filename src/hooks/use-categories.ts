import { useCallback } from "react";
import { categoryService } from "@/services/category.service";
import type { CategoryInput, SubCategoryInput } from "@/types/category.types";
import {
  addCategory,
  addSubCategory,
  removeCategory,
  removeSubCategory,
  setCategories,
  setCategoriesLoading,
  setSubCategoryOrder,
  updateCategory,
  updateSubCategory,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useCategories() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.category.categories);
  const status = useAppSelector((state) => state.category.status);

  const loadCategories = useCallback(async () => {
    dispatch(setCategoriesLoading());
    const data = await categoryService.fetchCategories();
    dispatch(setCategories(data));
  }, [dispatch]);

  const createCategory = useCallback(
    async (input: CategoryInput) => {
      const created = await categoryService.createCategory(input);
      dispatch(addCategory(created));
    },
    [dispatch],
  );

  const editCategory = useCallback(
    async (id: string, input: CategoryInput) => {
      const updated = await categoryService.updateCategory(id, input);
      dispatch(updateCategory(updated));
    },
    [dispatch],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await categoryService.deleteCategory(id);
      dispatch(removeCategory(id));
    },
    [dispatch],
  );

  const reorderCategories = useCallback(
    async (orderedIds: string[]) => {
      const updated = await categoryService.reorderCategories(orderedIds);
      dispatch(setCategories(updated));
    },
    [dispatch],
  );

  const createSubCategory = useCallback(
    async (categoryId: string, input: SubCategoryInput) => {
      const created = await categoryService.createSubCategory(categoryId, input);
      dispatch(addSubCategory({ categoryId, subCategory: created }));
    },
    [dispatch],
  );

  const editSubCategory = useCallback(
    async (categoryId: string, id: string, input: SubCategoryInput) => {
      const updated = await categoryService.updateSubCategory(categoryId, id, input);
      dispatch(updateSubCategory({ categoryId, subCategory: updated }));
    },
    [dispatch],
  );

  const deleteSubCategory = useCallback(
    async (categoryId: string, id: string) => {
      await categoryService.deleteSubCategory(categoryId, id);
      dispatch(removeSubCategory({ categoryId, subCategoryId: id }));
    },
    [dispatch],
  );

  const reorderSubCategories = useCallback(
    async (categoryId: string, orderedIds: string[]) => {
      const updated = await categoryService.reorderSubCategories(categoryId, orderedIds);
      dispatch(setSubCategoryOrder({ categoryId, subCategories: updated }));
    },
    [dispatch],
  );

  return {
    categories,
    status,
    loadCategories,
    createCategory,
    editCategory,
    deleteCategory,
    reorderCategories,
    createSubCategory,
    editSubCategory,
    deleteSubCategory,
    reorderSubCategories,
  };
}
