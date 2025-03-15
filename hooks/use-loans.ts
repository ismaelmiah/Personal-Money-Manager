"use client"

import useSWR from "swr"
import { useEffect } from "react"
import type { Loan } from "@/lib/loan-tracker-service"
import { useOptimistic } from "@/lib/optimistic-context"

export function useLoans() {
  const { data: fetchedLoans, error, isLoading, mutate } = useSWR<Loan[]>("/api/loans")
  const {
    data: optimisticData,
    setOptimisticLoans,
    addOptimisticLoan,
    updateOptimisticLoan,
    deleteOptimisticLoan,
  } = useOptimistic()

  // Sync fetched data with optimistic state when it loads
  useEffect(() => {
    if (fetchedLoans && !optimisticData.loans.length) {
      setOptimisticLoans(fetchedLoans)
    }
  }, [fetchedLoans, optimisticData.loans.length, setOptimisticLoans])

  // Use optimistic data if available, otherwise use fetched data
  const loans = optimisticData.loans.length > 0 ? optimisticData.loans : fetchedLoans || []

  return {
    loans,
    isLoading,
    isError: error,
    mutate,
    // Add optimistic update functions
    addLoan: async (loan: Loan) => {
      // Add to optimistic state immediately
      addOptimisticLoan(loan)

      // Make API call in the background
      try {
        await fetch("/api/loans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loan),
        })
        // Revalidate data after successful API call
        mutate()
      } catch (error) {
        console.error("Error adding loan:", error)
        // Revalidate to restore correct state
        mutate()
      }
    },
    updateLoan: async (loan: Loan) => {
      // Update optimistic state immediately
      updateOptimisticLoan(loan)

      // Make API call in the background
      try {
        await fetch(`/api/loans/${loan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loan),
        })
        // Revalidate data after successful API call
        mutate()
      } catch (error) {
        console.error("Error updating loan:", error)
        // Revalidate to restore correct state
        mutate()
      }
    },
    deleteLoan: async (id: string) => {
      // Update optimistic state immediately
      deleteOptimisticLoan(id)

      // Make API call in the background
      try {
        await fetch(`/api/loans/${id}`, {
          method: "DELETE",
        })
        // Revalidate data after successful API call
        mutate()
      } catch (error) {
        console.error("Error deleting loan:", error)
        // Revalidate to restore correct state
        mutate()
      }
    },
  }
}

