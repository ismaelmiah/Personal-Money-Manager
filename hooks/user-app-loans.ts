"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppLoans() {
  const { loans, isLoading, isError, refreshLoans, refreshMembers, refreshStatistics, addLoan, updateLoan, deleteLoan } = useAppData()

  return {
    loans,
    isLoading,
    isError,
    refreshLoans: refreshLoans,
    refreshMembers: refreshMembers,
    refreshStatistics: refreshStatistics,
    addLoan,
    updateLoan,
    deleteLoan,
  }
}

