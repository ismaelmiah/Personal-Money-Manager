"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppTransactions() {
  const { transactions, isLoading, isError, refreshData, addTransaction, updateTransaction, deleteTransaction } =
    useAppData()

  return {
    transactions,
    isLoading,
    isError,
    mutate: refreshData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

