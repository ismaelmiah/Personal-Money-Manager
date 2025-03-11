import useSWR from "swr"
import type { Transaction } from "@/lib/money-manager-service"

export function useTransactions() {
  const { data, error, isLoading, mutate } = useSWR<Transaction[]>("/api/money-manager/transactions")

  return {
    transactions: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

