"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppLoans() {
  const { loans, isLoading, isError, refreshData, addLoan, updateLoan, deleteLoan } = useAppData()

  return {
    loans,
    isLoading,
    isError,
    mutate: refreshData,
    addLoan,
    updateLoan,
    deleteLoan,
  }
}

