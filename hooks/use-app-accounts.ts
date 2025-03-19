"use client"

import { useAppData } from "@/providers/data-provider"

export function useAppAccounts() {
  const { accounts, isLoading, isError, refreshData, addAccount, updateAccount, deleteAccount } = useAppData()

  return {
    accounts,
    isLoading,
    isError,
    mutate: refreshData,
    addAccount,
    updateAccount,
    deleteAccount,
  }
}

