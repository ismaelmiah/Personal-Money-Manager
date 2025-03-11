import useSWR from "swr"
import type { Loan } from "@/lib/loan-tracker-service"

export function useLoans() {
  const { data, error, isLoading, mutate } = useSWR<Loan[]>("/api/loans")

  return {
    loans: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

