"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppCategories() {
  const { categories, isLoading, isError, refreshData, addCategory, updateCategory, deleteCategory } = useAppData()

  return {
    categories,
    isLoading,
    isError,
    mutate: refreshData,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}

