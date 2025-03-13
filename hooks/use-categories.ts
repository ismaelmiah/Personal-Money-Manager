import useSWR from "swr"
import type { Category } from "@/lib/money-manager-service"

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>("/api/money-manager/categories")

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

