import useSWR from "swr"
import type { Account } from "@/lib/money-manager-service"

export function useAccounts() {
  const { data, error, isLoading, mutate } = useSWR<Account[]>("/api/money-manager/accounts")

  return {
    accounts: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

